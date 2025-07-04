import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("/api/")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
    fetch("/api/query/")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  }, []);
  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello there!</h1>
      <section>
        <h2>Hello there!</h2>
      </section>
    </>
  );
}

export default App;
