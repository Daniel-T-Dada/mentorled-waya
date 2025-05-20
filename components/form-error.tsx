import { TriangleAlert } from "lucide-react"

interface FormErrorProps {
    message: string | undefined
}

const FormError = ({ message }: FormErrorProps) => {
    if (!message) return null
    return (
        <div className="flex items-center gap-x-2 text-destructive bg-destructive/15 p-3 rounded-md">
            <TriangleAlert className="w-4 h-4" />
            <p className="text-sm">{message}</p>
        </div>
        )
}

export default FormError
