export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h16m-6-6 6 6-6 6'} />
    </svg>
  );
}
export function Leaf({ variant = 0 }: { variant?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
    >
      {variant === 0 ? (
        <>
          <path d="M40 69V26M40 49C15 47 17 27 17 27s24-1 23 22Zm0-12C64 35 63 14 63 14S40 15 40 37Z" />
          <path d="m24 34 16 15m0-12 15-15" />
        </>
      ) : variant === 1 ? (
        <>
          <path d="M40 65C17 52 10 33 18 23c13 1 22 13 22 25 0-12 9-24 22-25 8 10 1 29-22 42Z" />
          <path d="M40 48c-14-13-13-28 0-39 13 11 14 26 0 39ZM19 61c14 11 28 11 42 0" />
        </>
      ) : (
        <>
          <path d="M15 40c0-15 11-26 25-26s25 11 25 26-11 26-25 26S15 55 15 40Z" />
          <circle cx="40" cy="40" r="12" />
          <path d="M40 8v12m0 40v12M8 40h12m40 0h12" />
        </>
      )}
    </svg>
  );
}
