const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <div className="flex flex-col items-center justify-center h-screen">
                {children}
            </div>
        </div>
    )
}
export default DashboardLayout