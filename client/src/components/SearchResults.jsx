import React, { useEffect, useState } from "react";
import QuestionFeed from "./QuestionFeed";
import qs from "query-string";

function SearchResults(props) {
  const [query, setQuery] = useState(qs.parse(props.location.search).q || "");

  useEffect(() => {
    setQuery(qs.parse(props.location.search).q);
  }, [qs.parse(props.location.search).q]);

  return <QuestionFeed key={query} q={query} {...props}></QuestionFeed>;
}

export default SearchResults;
