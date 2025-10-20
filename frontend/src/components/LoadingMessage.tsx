interface LoadingMessageProps {
  message?: string;
}

export const LoadingMessage = ({ message = "Chargement..." }: LoadingMessageProps) => {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="text-slate-700 text-xl py-12">{message}</div>
    </div>
  );
};
