interface Props {
  className?: string
  strokeWidth?: number
}

const WillowLogo = ({ className = '', strokeWidth = 1.75 }: Props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 22V12" />
    <path d="M12 12C12 12 8 9 8 5a4 4 0 0 1 8 0c0 4-4 7-4 7Z" />
    <path d="M12 12C12 12 16 10 18 7" />
    <path d="M12 12C12 12 8 10 6 7" />
    <path d="M12 17C12 17 9 15.5 8 13" />
    <path d="M12 17C12 17 15 15.5 16 13" />
  </svg>
)

export default WillowLogo
