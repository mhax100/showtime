import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error = useRouteError() as Error;

    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-background'>
             <div className="p-6 text-center text-red-500 rounded-md bg-red-500/5 min-w-1/2">
                <h1 className="text-3xl font-bold">Oops, seems like something went wrong!</h1>
                <p>{error.message}</p>
            </div>
        </div>
    )
}