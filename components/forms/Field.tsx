import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-ink shadow-sm placeholder:text-ink-muted focus:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-0";

function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-brand-900">
      {children}
      {required && <span className="ml-0.5 text-accent-600" aria-hidden>*</span>}
    </label>
  );
}

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm text-red-600" role="alert">
      {message}
    </p>
  );
}

interface BaseProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
}

export function TextField({
  id,
  label,
  error,
  required,
  ...rest
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(fieldBase, error && "border-red-400")}
        {...rest}
      />
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  );
}

export function TextArea({
  id,
  label,
  error,
  required,
  ...rest
}: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <textarea
        id={id}
        name={id}
        rows={5}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(fieldBase, "resize-y", error && "border-red-400")}
        {...rest}
      />
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  );
}

export function SelectField({
  id,
  label,
  error,
  required,
  children,
  ...rest
}: BaseProps & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <select
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(fieldBase, "appearance-none bg-no-repeat", error && "border-red-400")}
        {...rest}
      >
        {children}
      </select>
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  );
}

/** Pot-de-miel anti-spam : champ caché aux humains, leurre pour bots. */
export function Honeypot() {
  return (
    <div className="absolute left-[-9999px]" aria-hidden tabIndex={-1}>
      <label htmlFor="company">Société (ne pas remplir)</label>
      <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
