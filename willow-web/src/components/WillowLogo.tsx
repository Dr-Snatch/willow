interface Props {
  className?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean | 'true' | 'false';
  title?: string;
}

const WillowLogo = ({
  className,
  strokeWidth = 1.75,
  'aria-hidden': ariaHidden = true,
  title,
}: Props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden={ariaHidden}
    role={ariaHidden ? undefined : 'img'}
  >
    {title && <title>{title}</title>}
    <path d="M12 22v-9" stroke="currentColor" strokeWidth={strokeWidth} />
    <path
      d="M12 15C10 13 7 13 6 15.5C5 18 6.5 21 8 22"
      stroke="currentColor"
      strokeWidth={strokeWidth * 0.8}
    />
    <path
      d="M12 15C14 13 17 13 18 15.5C19 18 17.5 21 16 22"
      stroke="currentColor"
      strokeWidth={strokeWidth * 0.8}
    />
    <path
      d="M12 13C10.5 11 8.5 10.5 8 12.5C7.5 14.5 8.5 18 9.5 20"
      stroke="currentColor"
      strokeWidth={strokeWidth * 0.7}
    />
    <path
      d="M12 13C13.5 11 15.5 10.5 16 12.5C16.5 14.5 15.5 18 14.5 20"
      stroke="currentColor"
      strokeWidth={strokeWidth * 0.7}
    />
    <path
      d="M12 13C11.5 10 11 8 12 6C13 8 12.5 10 12 13"
      stroke="currentColor"
      strokeWidth={strokeWidth * 0.7}
    />
  </svg>
);

export default WillowLogo;
