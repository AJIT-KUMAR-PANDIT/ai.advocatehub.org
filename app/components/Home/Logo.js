import Image from "next/image";

export default function Logo() {
    return (
        <div className="mb-[38px] w-full flex justify-center">
            <Image
                src="/advocatehub.webp"
                alt="AdvocateHub Search Logo"
                width={272}
                height={92}
                className="object-contain max-h-[92px] w-auto"
                priority
            />
        </div>
    );
}
