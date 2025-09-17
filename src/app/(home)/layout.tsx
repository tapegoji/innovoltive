import { Header } from '@/components/Header'

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Header compact className="fixed top-0 left-0 right-0 z-50"/>
      {children}
    </>
  )
}