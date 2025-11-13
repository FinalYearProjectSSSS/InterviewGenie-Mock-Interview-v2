import { cn, getTechLogos } from "@/lib/utils";
import Image from "next/image";

const DisplayTechIcons = async ({ techStack }: TechIconProps) => {
  const techIcons = await getTechLogos(techStack);

  return (
    <div className="flex items-center">
      {techIcons.slice(0, 3).map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-muted rounded-full p-2 border border-border shadow-sm hover:shadow-md transition-all duration-300",
            index >= 1 && "-ml-3"
          )}
        >
          {/* Tooltip */}
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-foreground text-background text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {tech}
          </span>

          {/* Icon */}
          <Image
            src={url}
            alt={tech}
            width={24}
            height={24}
            className="object-contain size-5"
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;
