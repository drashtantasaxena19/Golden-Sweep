interface SectionHeadingProps {
    eyebrow: string
    title: string
    description: string
}

const SectionHeading = ({
    eyebrow,
    title,
    description,
}: SectionHeadingProps) => {
    return (
        <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.3em] text-gold-400">
                {eyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
                {title}
            </h2>

            <p className="mt-4 text-white/50">
                {description}
            </p>
        </div>
    )
}

export default SectionHeading