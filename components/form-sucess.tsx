import { CheckCircle } from "lucide-react"

interface FormSuccessProps {
    message: string | null | undefined
}

const FormSuccess = ({ message }: FormSuccessProps) => {
    if (!message) return null
    return (
        <div className="flex items-center gap-x-2 text-emerald-500 bg-emerald-500/15 p-3 rounded-md">
            <CheckCircle className="w-4 h-4" />
            <p className="text-sm">{message}</p>
        </div>
        )
}

export default FormSuccess
