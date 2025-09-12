export default function NewProject() {
  return (
    <section className="container py-10 space-y-6">
      <h1 className="text-3xl font-bold">Create project</h1>
      <form className="space-y-4 max-w-xl">
        <input className="input" placeholder="Project title" />
        <textarea className="input min-h-32" placeholder="Brief: what are we making?"></textarea>
        <div className="grid md:grid-cols-2 gap-3">
          <input className="input" placeholder="Role needed (e.g., Illustrator)" />
          <input className="input" placeholder="Location (optional)" />
        </div>
        <button className="btn" type="button">Create</button>
      </form>
    </section>
  );
}
