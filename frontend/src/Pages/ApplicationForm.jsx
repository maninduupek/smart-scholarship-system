function ApplicationForm() {
  return (
    <main>
      <section>
        <h1>Scholarship Application</h1>

        <form>
          <div>
            <label>Full Name</label>
            <input type="text" />
          </div>

          <div>
            <label>Email</label>
            <input type="email" />
          </div>

          <div>
            <label>University</label>
            <input type="text" />
          </div>

          <div>
            <label>Course</label>
            <input type="text" />
          </div>

          <div>
            <label>Academic Year</label>
            <input type="number" />
          </div>

          <div>
            <label>Statement of Purpose</label>
            <textarea rows="5"></textarea>
          </div>

          <button type="submit">Submit Application</button>
        </form>
      </section>
    </main>
  );
}

export default ApplicationForm;