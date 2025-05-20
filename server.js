const jsonServer = require('json-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create the server
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Set the JWT secret
const JWT_SECRET = 'wayasupersecrettoken12345';

// Set the port
const PORT = 3001;

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'simplytobs@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Verify email configuration
transporter.verify((error) => {
  if (error) {
    console.error('\n❌ Email configuration error:', error.message);
    if (!process.env.GMAIL_APP_PASSWORD) {
      console.error('\n⚠️  GMAIL_APP_PASSWORD is not set in .env file');
      console.error('Please create a .env file in the mock-server directory with:');
      console.error('GMAIL_APP_PASSWORD=your_16_character_app_password_here\n');
    }
    process.exit(1);
  } else {
    console.log('\n✅ Email configuration verified successfully');
  }
});

// Enable the default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Parse the request body
server.use(jsonServer.bodyParser);

// Handle authentication-related requests
server.post('/api/signup', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Check if email already exists in users or pendingUsers
  const userExists = db.users.find(user => user.email === email);
  const pendingUserExists = db.pendingUsers.find(user => user.email === email);

  if (userExists || pendingUserExists) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Generate a verification token
  const verificationToken = uuidv4();

  // Create a pending user
  const pendingUser = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    role: 'parent',
    emailVerified: null,
    createdAt: new Date().toISOString()
  };

  // Store the verification token
  const tokenEntry = {
    token: verificationToken,
    userId: pendingUser.id,
    email: pendingUser.email,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };

  // Add to database
  db.pendingUsers.push(pendingUser);
  db.verificationTokens.push(tokenEntry);

  // Save the updated database
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  // TEMPORARILY COMMENTED OUT EMAIL VERIFICATION
  /*
  try {
    // Send verification email
    const verificationUrl = `http://localhost:3000/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Waya" <noreply@waya.com>',
      to: email,
      subject: "Verify your email address",
      html: `
        <p>Welcome to Waya!</p>
        <p>Please click the link below to verify your email address:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    // Log verification URL to terminal for development
    console.log('\n------------------------------------------------');
    console.log(`📧 VERIFICATION EMAIL for ${email}:`);
    console.log(`🔗 Verification URL: ${verificationUrl}`);
    console.log('------------------------------------------------\n');
  } catch (error) {
    console.error('Error sending verification email:', error);
    return res.status(500).json({ error: 'Failed to send verification email' });
  }
  */

  // Move user directly to users collection instead of pending
  db.users.push(pendingUser);
  db.pendingUsers = db.pendingUsers.filter(user => user.id !== pendingUser.id);

  return res.status(201).json({
    message: 'User created successfully',
    user: {
      id: pendingUser.id,
      name: pendingUser.name,
      email: pendingUser.email,
      role: pendingUser.role
    }
  });
});

// Store verification token endpoint
server.post('/api/store-verification-token', (req, res) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ error: 'User ID and token are required' });
  }

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Store the verification token
  const tokenEntry = {
    token,
    userId,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };

  db.verificationTokens.push(tokenEntry);

  // Save the updated database
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  return res.status(201).json({ message: 'Verification token stored successfully' });
});

// Verify email endpoint
server.post('/api/verify-email', (req, res) => {
  const { token, email } = req.body;

  if (!token || !email) {
    return res.status(400).json({ error: 'Token and email are required' });
  }

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  let db;

  try {
    const dbContent = fs.readFileSync(dbPath, 'utf-8');
    db = JSON.parse(dbContent);
  } catch (error) {
    console.error("Error reading database:", error);
    return res.status(500).json({ error: 'Server error reading database' });
  }

  // Find the verification token
  const tokenEntry = db.verificationTokens.find(entry => entry.token === token);

  if (!tokenEntry) {
    return res.status(404).json({ error: 'Invalid verification token' });
  }

  // Check if the token has expired
  if (new Date(tokenEntry.expires) < new Date()) {
    return res.status(410).json({ error: 'Verification token has expired' });
  }

  // Find the pending user
  const pendingUser = db.pendingUsers.find(user => user.id === tokenEntry.userId);

  if (!pendingUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update the user's status and move them to the users collection
  pendingUser.emailVerified = new Date().toISOString();
  db.users.push(pendingUser);

  // Remove the user from pending users and remove the token
  db.pendingUsers = db.pendingUsers.filter(user => user.id !== tokenEntry.userId);
  db.verificationTokens = db.verificationTokens.filter(entry => entry.token !== token);

  // Save the updated database
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("Error saving database:", error);
    return res.status(500).json({ error: 'Server error saving database' });
  }

  // Log successful verification
  console.log('\n------------------------------------------------');
  console.log(`✅ Email verified successfully for user: ${pendingUser.email}`);
  console.log('------------------------------------------------\n');

  return res.json({
    id: pendingUser.id,
    name: pendingUser.name,
    email: pendingUser.email,
    role: pendingUser.role,
    emailVerified: pendingUser.emailVerified
  });
});

// Resend verification email endpoint
server.post('/api/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Find the pending user
  const pendingUser = db.pendingUsers.find(user => user.email === email);
  if (!pendingUser) {
    return res.status(404).json({ error: 'No pending user found with this email' });
  }

  // Generate a new verification token
  const verificationToken = uuidv4();

  // Remove old token if exists
  db.verificationTokens = db.verificationTokens.filter(t => t.userId !== pendingUser.id);

  // Store the new verification token
  const tokenEntry = {
    token: verificationToken,
    userId: pendingUser.id,
    email: pendingUser.email,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };

  // Add to database
  db.verificationTokens.push(tokenEntry);

  // Save the updated database
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  try {
    // Send verification email
    const verificationUrl = `http://localhost:3000/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Waya" <noreply@waya.com>',
      to: email,
      subject: "Verify your email address",
      html: `
        <p>Welcome to Waya!</p>
        <p>Please click the link below to verify your email address:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    // Log verification URL to terminal for development
    console.log('\n------------------------------------------------');
    console.log(`📧 RESENT VERIFICATION EMAIL for ${email}:`);
    console.log(`🔗 Verification URL: ${verificationUrl}`);
    console.log('------------------------------------------------\n');

    return res.status(200).json({
      message: 'Verification email resent successfully.',
      verificationUrl,
      note: 'Check your console (F12 > Console) and the server terminal for the verification link'
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return res.status(500).json({ error: 'Failed to send verification email' });
  }
});

server.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  console.log(`👤 Login attempt for: ${email}`);

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  let db;

  try {
    const dbContent = fs.readFileSync(dbPath, 'utf-8');
    db = JSON.parse(dbContent);
    console.log(`📊 Total users in database: ${db.users.length}`);

    // Debug: List all users' emails
    console.log("Available users:", db.users.map(u => u.email).join(", "));
  } catch (error) {
    console.error("Error reading database:", error);
    return res.status(500).json({ error: 'Server error reading database' });
  }

  // Find the user
  const user = db.users.find(user => user.email === email);

  if (!user) {
    console.log(`❌ User not found: ${email}`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check if the email is verified
  if (!user.emailVerified) {
    console.log(`❌ Email not verified: ${email}`);
    return res.status(403).json({ error: 'Email not verified' });
  }

  // Verify the password
  const validPassword = bcrypt.compareSync(password, user.password);

  if (!validPassword) {
    console.log(`❌ Invalid password for: ${email}`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  console.log(`✅ Login successful for: ${email} (${user.role})`);

  // Create a JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  // Return user info without the password
  const { password: _, ...userWithoutPassword } = user;

  return res.json({
    ...userWithoutPassword,
    token
  });
});

// Kid account login endpoint
server.post('/api/kid-login', (req, res) => {
  const { username, pin } = req.body;

  if (!username || !pin) {
    return res.status(400).json({ error: 'Username and PIN are required' });
  }

  console.log(`👶 Kid login attempt for: ${username}`);

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  let db;

  try {
    const dbContent = fs.readFileSync(dbPath, 'utf-8');
    db = JSON.parse(dbContent);
  } catch (error) {
    console.error("Error reading database:", error);
    return res.status(500).json({ error: 'Server error reading database' });
  }

  // Find the kid user by username
  const kid = db.kids.find(kid => kid.username.toLowerCase() === username.toLowerCase());

  if (!kid) {
    console.log(`❌ Kid user not found: ${username}`);
    return res.status(401).json({ error: 'Invalid username or PIN' });
  }

  // Verify the PIN (stored as a hash in DB)
  const validPin = bcrypt.compareSync(pin, kid.pinHash);

  if (!validPin) {
    console.log(`❌ Invalid PIN for kid: ${username}`);
    return res.status(401).json({ error: 'Invalid username or PIN' });
  }

  console.log(`✅ Kid login successful for: ${username}`);

  // Create a JWT token
  const token = jwt.sign(
    {
      id: kid.id,
      username: kid.username,
      role: 'kid',
      parentId: kid.parentId
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  return res.json({
    id: kid.id,
    name: kid.name,
    username: kid.username,
    role: 'kid',
    parentId: kid.parentId,
    avatar: kid.avatar || null,
    token
  });
});

// Kid account creation endpoint
server.post('/api/create-kid', (req, res) => {
  const { name, username, pin, parentId, avatar } = req.body;

  if (!name || !username || !pin || !parentId) {
    return res.status(400).json({ error: 'Name, username, PIN and parentId are required' });
  }

  // Validate pin format (4 digits)
  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'PIN must be 4 digits' });
  }

  console.log(`👶 Creating kid account: ${name} (${username})`);

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  let db;

  try {
    const dbContent = fs.readFileSync(dbPath, 'utf-8');
    db = JSON.parse(dbContent);

    // Create kids array if it doesn't exist
    if (!db.kids) {
      db.kids = [];
    }

  } catch (error) {
    console.error("Error reading database:", error);
    return res.status(500).json({ error: 'Server error reading database' });
  }

  // Check if the parent exists
  const parentExists = db.users.some(user => user.id === parentId && user.role === 'parent');

  if (!parentExists) {
    return res.status(404).json({ error: 'Parent not found' });
  }

  // Check if username is already taken
  const usernameExists = db.kids.some(kid => kid.username.toLowerCase() === username.toLowerCase());

  if (usernameExists) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  // Hash the PIN
  const pinHash = bcrypt.hashSync(pin, 10);

  // Create a new kid account
  const newKid = {
    id: uuidv4(),
    name,
    username,
    pinHash,
    parentId,
    role: 'kid',
    avatar: avatar || null,
    createdAt: new Date().toISOString()
  };

  // Add to database
  db.kids.push(newKid);

  // Save the updated database
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log(`✅ Kid account created: ${name} (${username})`);
  } catch (error) {
    console.error("Error saving database:", error);
    return res.status(500).json({ error: 'Server error saving database' });
  }

  return res.status(201).json({
    id: newKid.id,
    name: newKid.name,
    username: newKid.username,
    parentId: newKid.parentId,
    message: 'Kid account created successfully'
  });
});

// Fetch kids for a parent
server.get('/api/parent/:parentId/kids', (req, res) => {
  const { parentId } = req.params;

  if (!parentId) {
    return res.status(400).json({ error: 'Parent ID is required' });
  }

  console.log(`🔍 Fetching kids for parent: ${parentId}`);

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  let db;

  try {
    const dbContent = fs.readFileSync(dbPath, 'utf-8');
    db = JSON.parse(dbContent);

    // Create kids array if it doesn't exist
    if (!db.kids) {
      db.kids = [];
    }

  } catch (error) {
    console.error("Error reading database:", error);
    return res.status(500).json({ error: 'Server error reading database' });
  }

  // Filter kids by parent ID
  const parentKids = db.kids.filter(kid => kid.parentId === parentId);

  console.log(`✅ Found ${parentKids.length} kids for parent: ${parentId}`);

  // Return kids data without sensitive information
  const safeKids = parentKids.map(kid => {
    // Remove sensitive data like pinHash
    const { pinHash, ...safeKid } = kid;
    return safeKid;
  });

  return res.json(safeKids);
});

// Get kid's data by ID
server.get('/api/kids/:id', (req, res) => {
  const { id } = req.params;

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  let db;

  try {
    const dbContent = fs.readFileSync(dbPath, 'utf-8');
    db = JSON.parse(dbContent);
  } catch (error) {
    console.error("Error reading database:", error);
    return res.status(500).json({ error: 'Server error reading database' });
  }

  // Find the kid
  const kid = db.kids.find(k => k.id === id);

  if (!kid) {
    return res.status(404).json({ error: 'Kid not found' });
  }

  // Return kid's data without sensitive information
  const { pinHash, ...kidData } = kid;

  return res.json(kidData);
});

// Delete a kid by ID
server.delete('/api/kids/:id', (req, res) => {
  const { id } = req.params;
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const kidIndex = db.kids.findIndex(k => k.id === id);
  if (kidIndex === -1) {
    return res.status(404).json({ error: 'Kid not found' });
  }
  db.kids.splice(kidIndex, 1);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  return res.status(204).send();
});

// Chore Management Endpoints

// Create a new chore
server.post('/api/chores', (req, res) => {
  const { title, description, reward, dueDate, assignedTo, parentId } = req.body;

  if (!title || !description || !reward || !dueDate || !assignedTo || !parentId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Verify the kid exists and belongs to the parent
  const kid = db.kids.find(k => k.id === assignedTo && k.parentId === parentId);
  if (!kid) {
    return res.status(404).json({ error: 'Kid not found or does not belong to parent' });
  }

  // Create new chore
  const newChore = {
    id: uuidv4(),
    title,
    description,
    reward: Number(reward),
    dueDate,
    assignedTo,
    parentId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    completedAt: null
  };

  // Initialize chores array if it doesn't exist
  if (!db.chores) {
    db.chores = [];
  }

  // Add to database
  db.chores.push(newChore);

  // Save the updated database
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  return res.status(201).json(newChore);
});

// Get all chores for a parent
server.get('/api/chores', (req, res) => {
  const { parentId, kidId, status } = req.query;

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Initialize chores array if it doesn't exist
  if (!db.chores) {
    db.chores = [];
  }

  // Filter chores based on query parameters
  let filteredChores = db.chores;

  if (parentId) {
    filteredChores = filteredChores.filter(chore => chore.parentId === parentId);
  }

  if (kidId) {
    filteredChores = filteredChores.filter(chore => chore.assignedTo === kidId);
  }

  if (status) {
    filteredChores = filteredChores.filter(chore => chore.status === status);
  }

  return res.json(filteredChores);
});

// Update chore status
server.patch('/api/chores/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Valid status is required' });
  }

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  let db;
  try {
    const dbContent = fs.readFileSync(dbPath, 'utf-8');
    db = JSON.parse(dbContent);
  } catch (error) {
    console.error("Error reading database:", error);
    return res.status(500).json({ error: 'Server error reading database' });
  }

  // Initialize chores array if it doesn't exist
  if (!db.chores) {
    db.chores = [];
  }

  // Find the chore
  const choreIndex = db.chores.findIndex(chore => chore.id === id);
  if (choreIndex === -1) {
    return res.status(404).json({ error: 'Chore not found' });
  }

  // Update the chore
  const updatedChore = {
    ...db.chores[choreIndex],
    status,
    completedAt: status === 'completed' ? new Date().toISOString() : null
  };

  db.chores[choreIndex] = updatedChore;

  // Save the updated database
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log(`✅ Chore ${id} status updated to ${status}`);
  } catch (error) {
    console.error("Error saving database:", error);
    return res.status(500).json({ error: 'Server error saving database' });
  }

  return res.json(updatedChore);
});

// Delete a chore
server.delete('/api/chores/:id', (req, res) => {
  const { id } = req.params;

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Initialize chores array if it doesn't exist
  if (!db.chores) {
    db.chores = [];
  }

  // Find the chore
  const choreIndex = db.chores.findIndex(chore => chore.id === id);
  if (choreIndex === -1) {
    return res.status(404).json({ error: 'Chore not found' });
  }

  // Remove the chore
  db.chores.splice(choreIndex, 1);

  // Save the updated database
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  return res.status(204).send();
});

// Handle allowance creation with enhanced validation
server.post('/api/allowances', (req, res) => {
  const { kidId, parentId, amount, frequency, status } = req.body;

  // Validate required fields
  if (!kidId || !parentId || !amount || !frequency) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate amount is a positive number
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  // Validate frequency
  const validFrequencies = ['daily', 'weekly', 'monthly'];
  if (!validFrequencies.includes(frequency)) {
    return res.status(400).json({ error: 'Frequency must be daily, weekly, or monthly' });
  }

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Verify kid exists and belongs to parent
  const kid = db.kids.find(k => k.id === kidId && k.parentId === parentId);
  if (!kid) {
    return res.status(404).json({ error: 'Kid not found or does not belong to parent' });
  }

  // Check for existing active allowance
  const existingAllowance = db.allowances.find(
    a => a.kidId === kidId &&
      a.status === 'active' &&
      a.frequency === frequency
  );

  if (existingAllowance) {
    return res.status(409).json({
      error: 'Kid already has an active allowance with this frequency',
      existingAllowance
    });
  }

  // Create new allowance
  const newAllowance = {
    id: uuidv4(),
    kidId,
    parentId,
    amount: numericAmount,
    frequency,
    status: status || 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastPaidAt: null,
    nextPaymentDate: calculateNextPaymentDate(frequency)
  };

  // Initialize allowances array if it doesn't exist
  if (!db.allowances) {
    db.allowances = [];
  }

  // Add to database
  db.allowances.push(newAllowance);

  // Save the updated database
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  return res.status(201).json(newAllowance);
});

// Fetch allowances with filtering
server.get('/api/allowances', (req, res) => {
  const { parentId, kidId, status, frequency } = req.query;

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Initialize allowances array if it doesn't exist
  if (!db.allowances) {
    db.allowances = [];
  }

  // Filter allowances based on query parameters
  let filteredAllowances = db.allowances;

  if (parentId) {
    filteredAllowances = filteredAllowances.filter(a => a.parentId === parentId);
  }

  if (kidId) {
    filteredAllowances = filteredAllowances.filter(a => a.kidId === kidId);
  }

  if (status) {
    filteredAllowances = filteredAllowances.filter(a => a.status === status);
  }

  if (frequency) {
    filteredAllowances = filteredAllowances.filter(a => a.frequency === frequency);
  }

  // Sort by creation date (newest first)
  filteredAllowances.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return res.json(filteredAllowances);
});

// Update allowance status
server.patch('/api/allowances/:id', (req, res) => {
  const { id } = req.params;
  const { status, amount, frequency } = req.body;

  if (!status && !amount && !frequency) {
    return res.status(400).json({ error: 'No update fields provided' });
  }

  // Validate status if provided
  if (status && !['pending', 'active', 'paused', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // Validate amount if provided
  if (amount) {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
  }

  // Validate frequency if provided
  if (frequency && !['daily', 'weekly', 'monthly'].includes(frequency)) {
    return res.status(400).json({ error: 'Invalid frequency' });
  }

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Find the allowance
  const allowanceIndex = db.allowances.findIndex(a => a.id === id);
  if (allowanceIndex === -1) {
    return res.status(404).json({ error: 'Allowance not found' });
  }

  // Update the allowance
  const updatedAllowance = {
    ...db.allowances[allowanceIndex],
    ...(status && { status }),
    ...(amount && { amount: Number(amount) }),
    ...(frequency && {
      frequency,
      nextPaymentDate: calculateNextPaymentDate(frequency)
    }),
    updatedAt: new Date().toISOString()
  };

  // If status is being changed to active, update lastPaidAt
  if (status === 'active' && db.allowances[allowanceIndex].status !== 'active') {
    updatedAllowance.lastPaidAt = new Date().toISOString();
  }

  db.allowances[allowanceIndex] = updatedAllowance;

  // Save the updated database
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  return res.json(updatedAllowance);
});

// Helper function to calculate next payment date
function calculateNextPaymentDate(frequency) {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      return new Date(now.setDate(now.getDate() + 1)).toISOString();
    case 'weekly':
      return new Date(now.setDate(now.getDate() + 7)).toISOString();
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
    default:
      return null;
  }
}

// Get allowance history for a kid
server.get('/api/allowances/:kidId/history', (req, res) => {
  const { kidId } = req.params;
  const { startDate, endDate, status } = req.query;

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Initialize allowances array if it doesn't exist
  if (!db.allowances) {
    db.allowances = [];
  }

  // Get all allowances for the kid
  let kidAllowances = db.allowances.filter(a => a.kidId === kidId);

  // Filter by date range if provided
  if (startDate) {
    const start = new Date(startDate);
    kidAllowances = kidAllowances.filter(a => new Date(a.createdAt) >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    kidAllowances = kidAllowances.filter(a => new Date(a.createdAt) <= end);
  }

  // Filter by status if provided
  if (status) {
    kidAllowances = kidAllowances.filter(a => a.status === status);
  }

  // Sort by creation date (newest first)
  kidAllowances.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Calculate statistics
  const stats = {
    totalAllowances: kidAllowances.length,
    activeAllowances: kidAllowances.filter(a => a.status === 'active').length,
    totalAmount: kidAllowances.reduce((sum, a) => sum + a.amount, 0),
    averageAmount: kidAllowances.length > 0
      ? kidAllowances.reduce((sum, a) => sum + a.amount, 0) / kidAllowances.length
      : 0
  };

  return res.json({
    allowances: kidAllowances,
    statistics: stats
  });
});

// Process allowance payment
server.post('/api/allowances/:id/process-payment', (req, res) => {
  const { id } = req.params;
  const { amount, notes } = req.body;

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Initialize allowances array if it doesn't exist
  if (!db.allowances) {
    db.allowances = [];
  }

  // Find the allowance
  const allowanceIndex = db.allowances.findIndex(a => a.id === id);
  if (allowanceIndex === -1) {
    return res.status(404).json({ error: 'Allowance not found' });
  }

  const allowance = db.allowances[allowanceIndex];

  // Validate allowance status
  if (allowance.status !== 'active') {
    return res.status(400).json({
      error: 'Cannot process payment for inactive allowance',
      currentStatus: allowance.status
    });
  }

  // Validate payment amount
  const paymentAmount = Number(amount);
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    return res.status(400).json({ error: 'Payment amount must be a positive number' });
  }

  // Create payment record
  const payment = {
    id: uuidv4(),
    allowanceId: id,
    amount: paymentAmount,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  // Initialize payments array if it doesn't exist
  if (!db.payments) {
    db.payments = [];
  }

  // Add payment to database
  db.payments.push(payment);

  // Update allowance
  const updatedAllowance = {
    ...allowance,
    lastPaidAt: new Date().toISOString(),
    nextPaymentDate: calculateNextPaymentDate(allowance.frequency),
    updatedAt: new Date().toISOString()
  };

  db.allowances[allowanceIndex] = updatedAllowance;

  // Save the updated database
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  return res.status(201).json({
    payment,
    allowance: updatedAllowance
  });
});

// Get payment history for an allowance
server.get('/api/allowances/:id/payments', (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Initialize payments array if it doesn't exist
  if (!db.payments) {
    db.payments = [];
  }

  // Get all payments for the allowance
  let payments = db.payments.filter(p => p.allowanceId === id);

  // Filter by date range if provided
  if (startDate) {
    const start = new Date(startDate);
    payments = payments.filter(p => new Date(p.createdAt) >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    payments = payments.filter(p => new Date(p.createdAt) <= end);
  }

  // Sort by creation date (newest first)
  payments.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Calculate payment statistics
  const stats = {
    totalPayments: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    averageAmount: payments.length > 0
      ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length
      : 0,
    lastPayment: payments[0] || null
  };

  return res.json({
    payments,
    statistics: stats
  });
});

// Initialize wallet balance for a kid
server.post('/api/wallet/initialize', (req, res) => {
  console.log('HIT /api/wallet/initialize', req.body);
  const { kidId } = req.body;

  if (!kidId) {
    return res.status(400).json({ error: 'Kid ID is required' });
  }

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Verify kid exists
  const kid = db.kids.find(k => k.id === kidId);
  if (!kid) {
    return res.status(404).json({ error: 'Kid not found' });
  }

  // Initialize wallets array if it doesn't exist
  if (!db.wallets) {
    db.wallets = [];
  }

  // Check if wallet already exists
  const existingWallet = db.wallets.find(w => w.kidId === kidId);
  if (existingWallet) {
    return res.status(409).json({ error: 'Wallet already exists for this kid' });
  }

  // Create new wallet
  const newWallet = {
    id: uuidv4(),
    kidId,
    balance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Add to database
  db.wallets.push(newWallet);

  // Save the updated database
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  return res.status(201).json(newWallet);
});

// Get wallet balance
server.get('/api/wallet/:kidId', (req, res) => {
  const { kidId } = req.params;

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Initialize wallets array if it doesn't exist
  if (!db.wallets) {
    db.wallets = [];
  }

  // Find the wallet
  const wallet = db.wallets.find(w => w.kidId === kidId);
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }

  return res.json(wallet);
});

// Process wallet transaction (top-up or withdrawal)
server.post('/api/wallet/:kidId/transaction', (req, res) => {
  const { kidId } = req.params;
  const { type, amount, description } = req.body;

  if (!type || !amount || !description) {
    return res.status(400).json({ error: 'Type, amount, and description are required' });
  }

  if (!['topup', 'withdrawal'].includes(type)) {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Initialize wallets and transactions arrays if they don't exist
  if (!db.wallets) {
    db.wallets = [];
  }
  if (!db.transactions) {
    db.transactions = [];
  }

  // Find the wallet
  const walletIndex = db.wallets.findIndex(w => w.kidId === kidId);
  if (walletIndex === -1) {
    return res.status(404).json({ error: 'Wallet not found' });
  }

  const wallet = db.wallets[walletIndex];

  // Check sufficient balance for withdrawal
  if (type === 'withdrawal' && wallet.balance < numericAmount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  // Create transaction record
  const transaction = {
    id: uuidv4(),
    kidId,
    type,
    amount: numericAmount,
    description,
    status: 'completed',
    createdAt: new Date().toISOString()
  };

  // Update wallet balance
  const updatedWallet = {
    ...wallet,
    balance: type === 'topup'
      ? wallet.balance + numericAmount
      : wallet.balance - numericAmount,
    updatedAt: new Date().toISOString()
  };

  // Add transaction and update wallet
  db.transactions.push(transaction);
  db.wallets[walletIndex] = updatedWallet;

  // Save the updated database
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  return res.status(201).json({
    transaction,
    wallet: updatedWallet
  });
});

// Get transaction history
server.get('/api/wallet/:kidId/transactions', (req, res) => {
  const { kidId } = req.params;
  const { type, startDate, endDate, status } = req.query;

  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // Initialize transactions array if it doesn't exist
  if (!db.transactions) {
    db.transactions = [];
  }

  // Get all transactions for the kid
  let transactions = db.transactions.filter(t => t.kidId === kidId);

  // Filter by type if provided
  if (type) {
    transactions = transactions.filter(t => t.type === type);
  }

  // Filter by status if provided
  if (status) {
    transactions = transactions.filter(t => t.status === status);
  }

  // Filter by date range if provided
  if (startDate) {
    const start = new Date(startDate);
    transactions = transactions.filter(t => new Date(t.createdAt) >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    transactions = transactions.filter(t => new Date(t.createdAt) <= end);
  }

  // Sort by creation date (newest first)
  transactions.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Calculate statistics
  const stats = {
    totalTransactions: transactions.length,
    totalTopups: transactions.filter(t => t.type === 'topup').length,
    totalWithdrawals: transactions.filter(t => t.type === 'withdrawal').length,
    totalTopupAmount: transactions
      .filter(t => t.type === 'topup')
      .reduce((sum, t) => sum + t.amount, 0),
    totalWithdrawalAmount: transactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0)
  };

  return res.json({
    transactions,
    statistics: stats
  });
});

// Get spending data
server.get('/api/spending', (req, res) => {
  const db = router.db.getState();
  const spending = db.spending || [];
  res.json(spending);
});

// Get savings data
server.get('/api/savings', (req, res) => {
  const db = router.db.getState();
  const savings = db.savings || [];
  res.json(savings);
});

// Get task completion data
server.get('/api/taskCompletion', (req, res) => {
  const db = router.db.getState();
  const taskCompletion = db.taskCompletion || [];
  res.json(taskCompletion);
});

// PATCH /api/users/:id - Update parent profile (name, email, phone, avatar)
server.patch('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, avatar } = req.body;

  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const userIndex = db.users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update only provided fields
  if (name !== undefined) db.users[userIndex].name = name;
  if (email !== undefined) db.users[userIndex].email = email;
  if (phone !== undefined) db.users[userIndex].phone = phone;
  if (avatar !== undefined) db.users[userIndex].avatar = avatar;

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  return res.json(db.users[userIndex]);
});

// GET /api/users/:id - Fetch a user by ID
server.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// PATCH /api/users/:id/password - Update parent password
server.patch('/api/users/:id/password', (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const userIndex = db.users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  const user = db.users[userIndex];
  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  db.users[userIndex].password = bcrypt.hashSync(newPassword, 10);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  return res.json({ message: 'Password updated successfully' });
});

// PATCH /api/kids/:id/pin - Update kid PIN
server.patch('/api/kids/:id/pin', (req, res) => {
  const { id } = req.params;
  const { currentPin, newPin } = req.body;
  if (!currentPin || !newPin) {
    return res.status(400).json({ error: 'Current and new PIN are required' });
  }
  if (!/^\d{4}$/.test(newPin)) {
    return res.status(400).json({ error: 'New PIN must be 4 digits' });
  }
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const kidIndex = db.kids.findIndex(k => k.id === id);
  if (kidIndex === -1) {
    return res.status(404).json({ error: 'Kid not found' });
  }
  const kid = db.kids[kidIndex];
  if (!bcrypt.compareSync(currentPin, kid.pinHash)) {
    return res.status(401).json({ error: 'Current PIN is incorrect' });
  }
  db.kids[kidIndex].pinHash = bcrypt.hashSync(newPin, 10);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  return res.json({ message: 'PIN updated successfully' });
});

// DELETE /api/users/:id - Delete parent account and cascade delete kids, chores, etc.
server.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const userIndex = db.users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  // Remove user
  db.users.splice(userIndex, 1);
  // Remove kids, chores, wallets, transactions, notifications, etc. belonging to this parent
  db.kids = db.kids.filter(kid => kid.parentId !== id);
  db.chores = db.chores.filter(chore => chore.parentId !== id);
  db.wallets = db.wallets.filter(wallet => {
    const kid = db.kids.find(k => k.id === wallet.kidId);
    return kid && kid.parentId !== id;
  });
  db.transactions = db.transactions.filter(tx => {
    const kid = db.kids.find(k => k.id === tx.kidId);
    return kid && kid.parentId !== id;
  });
  db.notifications = db.notifications.filter(n => n.userId !== id);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  return res.status(204).send();
});

// Use the router
server.use(router);

// Start the server
server.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`Mock API Server is running on http://localhost:${PORT}`);
  console.log(`=================================================`);

  console.log(`\nVerification URLs will be logged here in the terminal`);
  console.log(`and returned in the response for easier testing.`);
  console.log(`=================================================\n`);
}); 