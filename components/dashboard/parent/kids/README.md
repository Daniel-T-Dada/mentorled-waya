# Kids Management Components

This folder contains a collection of reusable components for the Kids Management feature, organized with separation of concerns and modularity in mind.

## Structure

```
components/dashboard/parent/kids/
├── index.ts                    # Main export file
├── types.ts                    # Centralized type definitions
├── KidsManagement.tsx          # Main orchestrating component
├── useKidsData.ts              # Custom hook for data management
├── KidsPageHeader.tsx          # Page header with title and add button
├── KidsGrid.tsx               # Grid layout container
├── KidCard.tsx                # Individual kid card component
├── KidStats.tsx               # Stats display component
├── KidProgressBar.tsx         # Progress bar component
├── KidsLoadingSkeleton.tsx    # Loading state component
├── KidsEmptyState.tsx         # Empty state component
└── README.md                  # This documentation
```

## Components

### Main Component

- **`KidsManagement`**: The main component that orchestrates all other components. Use this in your pages.

### UI Components

- **`KidsPageHeader`**: Header section with title, description, and add button
- **`KidsGrid`**: Responsive grid container for kid cards
- **`KidCard`**: Individual card displaying kid information and stats
- **`KidStats`**: Stats grid showing completed/pending chores and balance
- **`KidProgressBar`**: Progress bar with percentage display
- **`KidsLoadingSkeleton`**: Loading skeleton for better UX
- **`KidsEmptyState`**: Empty state when no kids are available

### Custom Hook

- **`useKidsData`**: Custom hook that handles:
  - Loading kids data
  - Computing stats for each kid
  - Providing loading states
  - Refetch functionality

## Usage

### Basic Usage

```tsx
import { KidsManagement } from "@/components/dashboard/parent/kids";

export default function KidsPage() {
  const handleAddKid = () => {
    // Implement your add kid logic
    console.log("Add kid clicked");
  };

  return <KidsManagement onAddKid={handleAddKid} />;
}
```

### Using Individual Components

```tsx
import {
  KidsPageHeader,
  KidsGrid,
  KidCard,
  useKidsData,
} from "@/components/dashboard/parent/kids";

export default function CustomKidsPage() {
  const { kids, loading } = useKidsData();

  return (
    <div>
      <KidsPageHeader onAddKid={() => {}} />
      <KidsGrid>
        {kids.map((kid) => (
          <KidCard
            key={kid.id}
            kid={kid}
            completedChores={kid.stats.completedChores}
            pendingChores={kid.stats.pendingChores}
            progress={kid.stats.progress}
          />
        ))}
      </KidsGrid>
    </div>
  );
}
```

### Using the Custom Hook

```tsx
import { useKidsData } from "@/components/dashboard/parent/kids";

function MyComponent() {
  const { kids, loading, refetch } = useKidsData();

  // Use the data...
}
```

## Type Safety

All components are fully typed with TypeScript. The main types are defined in `types.ts`:

- `KidWithStats`: Kid data with computed stats
- `KidStats`: Stats interface
- Component prop interfaces for all components

## Extensibility

### Adding New Stats

To add new stats to kid cards:

1. Update the `KidStats` interface in `types.ts`
2. Modify the `getKidStats` function in `useKidsData.ts`
3. Update the `KidStats` component to display the new stats

### Adding New Components

To add new components:

1. Create the component file in this directory
2. Add the component export to `index.ts`
3. Define any new types in `types.ts`

### Customizing Behavior

Most components accept optional props for customization:

- `onAddKid`: Custom handler for add kid actions
- Event handlers for various interactions
- Styling props where applicable

## Dependencies

- React 18+ (uses hooks)
- Next.js (for Link component)
- Lucide React (for icons)
- shadcn/ui components
- Mock data service

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be used independently or together
3. **Type Safety**: Full TypeScript support with centralized types
4. **Maintainability**: Easy to modify individual components without affecting others
5. **Testing**: Each component can be tested in isolation
6. **Performance**: Loading states and error boundaries can be implemented per component
7. **Accessibility**: Each component can implement proper accessibility features

## Future Enhancements

- Add error handling components
- Implement optimistic updates
- Add animation components
- Create custom variants for different use cases
- Add comprehensive unit tests
