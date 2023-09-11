import { useEffect, useState } from "react";
import "./style.css";
import supabase from "./supabase";
import LoadingSpin from "react-loading-spin";

//REACT state function
// function Counter() {
//   const [count, setCount] = useState(0);
//   const [fontNumber, setFontNumber] = useState(40);
//   console.log(fontNumber);

//   return (
//     <div>
//       <span style={{ fontSize: fontNumber }}>{count}</span>
//       <button
//         className="btn btn-large"
//         onClick={() => {
//           setFontNumber((prevNumber) => prevNumber + 10);
//           setCount((prevCount) => prevCount + 1);
//         }}
//       >
//         +1
//       </button>
//       <button
//         className="btn btn-large"
//         onClick={() => {
//           setFontNumber(40);
//           setCount(0);
//         }}
//       >
//         RESET
//       </button>
//     </div>
//   );
// }

function App() {
  //define state variable
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  // dependency array in argument to only let the effect run once on first render
  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        let query = supabase.from("facts").select("*");

        if (currentCategory !== "all")
          query = query.eq("category", currentCategory);

        const { data: facts, error } = await query
          .order("votesInteresting", { ascending: false })
          .limit(1000);

        if (!error) setFacts(facts);
        else alert("There was a problem getting data!");
        setIsLoading(false);
      }
      getFacts();
    },
    [currentCategory]
  );

  return (
    // <></> aka fragmnt is a jsx elment that doesnt have any html output
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />
      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}
      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactsList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return (
    <div className="load-symbol">
      <LoadingSpin
        duration="2s"
        width="15px"
        timingFunction="ease-in-out"
        direction="alternate"
        size="200px"
        primaryColor="cyan"
        secondaryColor="#333"
        numberOfRotationsInAnimation={2}
      />
      <p className="message">Loading...</p>
    </div>
  );
}

function Header({ showForm, setShowForm }) {
  const appTitle = "Hakim's Tavern!";

  return (
    <header className="header">
      <div className="logo">
        <img
          src="logo.png"
          height="68"
          width="68"
          alt="Generic Messaging Logo"
        />
        <h1>{appTitle}</h1>
      </div>

      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((prevShow) => !prevShow)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
  { name: "singapore", color: "#7074b7" },
];

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  function isValidHttpUrl(string) {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }

  async function handleSubmit(eventObj) {
    //1. Prevent browser reload
    eventObj.preventDefault();

    //2. Check if data is valid. If so, create new fact
    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      //3. Upload fact to supabase and receive the new  fact object
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .select();
      setIsUploading(false);
      //4. Add the new fact to the UI => add to state (Use spread operator ... to get all elements from prev array and add it to new one)
      if (!error) setFacts((facts) => [newFact[0], ...facts]);
      //5. Rest input field to being empty
      setText("");
      setSource("");
      setCategory("");

      //6. Close form
      setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        //controlled component/input field
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(eventObj) => setText(eventObj.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={(eventObj) => setSource(eventObj.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(eventObj) => setCategory(eventObj.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

//prop drilling setFacts from parent to child
function FactsList({ facts, setFacts }) {
  // TEMPORARY
  if (facts.length === 0)
    return (
      <p className="message">
        {" "}
        No facts for this category yet. Create the first one? 🥺
      </p>
    );

  return (
    <section>
      {/* Passing/receiving props(data or argument) */}
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the database. Add your own!</p>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .select();
    setIsUpdating(false);

    if (!error)
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[⛔️DISPUTED⛔️]</span> : null}
        {fact.text}
        <a className="source" href={fact.source} target="_blank">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            .color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => handleVote("votesInteresting")}
          disabled={isUpdating}
        >
          👍 {fact.votesInteresting}
        </button>
        <button
          onClick={() => handleVote("votesMindblowing")}
          disabled={isUpdating}
        >
          🤯 {fact.votesMindblowing}
        </button>
        <button onClick={() => handleVote("votesFalse")} disabled={isUpdating}>
          ⛔️ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}
export default App;
