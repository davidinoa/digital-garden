import './page.css'

export default function FormValidationCss() {
  return (
    <main className="p-4">
      <form action="">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input required placeholder="Kevin" id="name" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            required
            id="email"
            type="email"
            placeholder="email@address.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            required
            id="password"
            type="password"
            minLength={12}
            placeholder="12+ characters"
          />
        </div>
        <button className="bg-white text-black rounded-lg p-1 mt-4">
          Submit
        </button>
      </form>
    </main>
  )
}
