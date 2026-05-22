import Link from "next/link";

export const metadata = {
  title: "Your submission was successful | Nutrizione24",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuccessPage() {
  return (
    <main className="success-page">
      <section>
        <p className="success-page__eyebrow">Nutrizione24</p>
        <h1>Your submission was successful</h1>
        <p>Grazie. La tua richiesta è stata ricevuta.</p>
        <Link href="/">Torna alla pagina principale</Link>
      </section>
    </main>
  );
}
