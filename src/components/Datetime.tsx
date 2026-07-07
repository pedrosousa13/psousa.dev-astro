interface DatetimesProps {
  pubDatetime: string | Date;
  modDatetime: string | Date | undefined | null;
}

interface Props extends DatetimesProps {
  size?: "sm" | "lg";
  className?: string;
}

export default function Datetime({
  pubDatetime,
  modDatetime,
  size = "sm",
  className,
}: Props) {
  return (
    <span
      className={`text-skin-dim inline-flex items-center gap-1 ${
        size === "sm" ? "text-sm" : "text-base"
      } ${className ?? ""}`}
    >
      <FormattedDatetime pubDatetime={pubDatetime} modDatetime={modDatetime} />
    </span>
  );
}

const FormattedDatetime = ({ pubDatetime, modDatetime }: DatetimesProps) => {
  const myDatetime = new Date(modDatetime ? modDatetime : pubDatetime);
  const isoDate = myDatetime.toISOString().slice(0, 10);

  return (
    <>
      {modDatetime ? (
        <span>updated</span>
      ) : (
        <span className="sr-only">published</span>
      )}
      <time dateTime={myDatetime.toISOString()}>{isoDate}</time>
    </>
  );
};
