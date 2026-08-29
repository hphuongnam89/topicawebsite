import Image from "next/image";

const credentialSamples = [
  {
    title: "Mẫu phôi bằng",
    image: "/official-assets/mau-phoi-bang.png",
  },
  {
    title: "Mẫu bảng điểm",
    image: "/official-assets/mau-bang-diem.png",
  },
];

export function CredentialSamples() {
  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-sans text-body-lg text-ink-700">
          Mẫu phôi bằng và mẫu bảng điểm áp dụng cho phương thức đào tạo từ xa.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {credentialSamples.map((sample) => (
          <figure
            key={sample.title}
            className="overflow-hidden rounded-lg border border-line-200 bg-white shadow-sm"
          >
            <div className="relative aspect-square w-full">
              <Image
                src={sample.image}
                alt={sample.title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <figcaption className="border-t border-line-200 px-5 py-4 text-center font-sans text-body font-semibold text-ink-950">
              {sample.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
