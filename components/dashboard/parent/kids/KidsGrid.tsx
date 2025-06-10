import type { KidsGridProps } from './types';

export const KidsGrid = ({ children }: KidsGridProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children}
        </div>
    );
};
