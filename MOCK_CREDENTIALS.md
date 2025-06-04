# Mock Credentials for Development

This document contains the mock credentials that can be used to test the application during development.

## Kid Login Credentials

Since the backend API is not yet connected, you can use these mock kid credentials to test the kid's dashboard environment:

### Test Kid Account

- **Username:** `testkid`
- **PIN:** `1234`

## How to Use

1. Go to the signin page: `/auth/signin`
2. Click on the "Kid" tab
3. Enter the username: `testkid`
4. Enter the PIN: `1234`
5. Click "Sign in"

This will authenticate you as a kid user and redirect you to the kids dashboard at `/dashboard/kids`.

## Parent Account Creation

Parents can create their accounts normally through the signup process. Once logged in as a parent, they can create additional kid accounts through the parent dashboard, but for now, the mock kid account above provides immediate access to test the kid's environment.

## Notes

- This is a temporary solution for development and testing
- The mock credentials are hardcoded in the `auth.ts` file under the "kid-credentials" provider
- Once the backend APIs are connected, these mock credentials will be replaced with real authentication
- The mock kid account has ID `kid-test-001` and is associated with parent ID `parent-001`
