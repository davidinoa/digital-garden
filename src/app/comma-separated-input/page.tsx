import Loading from './components/loading'

export default function CommaSeparatedInput() {
  return (
    <main className="bg-gray-900 min-h-screen py-40">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl text-white font-bold text-center">
          Comma Separated Input
        </h1>
        <Loading />
      </div>
    </main>
  )
}
