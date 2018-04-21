"use strict";

const classNameBuilder = function(classObj) {
  let className = "";
  for (var property1 in classObj) {
    if (classObj[property1]) {
      className += " " + property1;
    }
  }

  return className;
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    };

    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }
  
  componentWillMount() {
      document.addEventListener("keyup", this.handleKeyUp)
  }
  
  componentWillUnmount() {
      document.removeEventListener("keyup", this.handleKeyUp)
  }  
  
  handleMouseUp(index) {
    if (this.state && this.state.peeking && !this.state.open) {
      this.setState({
        open: false,
        peeking: false
      });
    } else if (this.state && this.state.open) {
      this.setState({
        open: false
      });
    }
  }

  handleOpen(id, peeking) {
    this.setState({
      open: this.state.open !== id ? id : false,
      starredOpen: noteById(id).starred,
      peeking: peeking
    });
  }
  
  handleKeyUp(e) {
      if (e.code == "KeyS" && e.altKey) {
          if (window.getSelection().toString() != "") {
              updateSearch(window.getSelection().toString());
          }
      } else if (e.code == "Escape" ) {
          this.setState({open: false});
      } 

      const getNextId = function (list, id) {
        let currentIndex = list.findIndex( n => {return id == n.id});
        return currentIndex == 0 ? list[list.length - 1].id : list[currentIndex - 1].id;
      }

      const getPreviousId = function (list, id) {
        let currentIndex = list.findIndex( n => {return id == n.id});
        return currentIndex == list.length-1 ? list[0].id : list[currentIndex + 1].id;
      }      

      const updateCardOpenState = (function (directionFunction) {
            if (this.state.starredOpen) {
              this.setState({open: directionFunction(this.props.starredNotes, this.state.open)});
            }
            else if (this.props.searchResultNotes){
              this.setState({ open: directionFunction(this.props.searchResultNotes, this.state.open)});            }
            else {
               this.setState({open: directionFunction(this.props.notes, this.state.open)});
            }

      }).bind(this);


      if (this.state && this.state.open !== false) {
        if (e.code == "ArrowLeft") {
            updateCardOpenState(getNextId);
        } else if (e.code == "ArrowRight") {
           updateCardOpenState(getPreviousId);
        } else if (e.code == "ArrowUp") {
          updateStarred(this.state.open);
        } else if (e.code == "ArrowDown") {
          this.setState({open: false});
        }
      }
  }

  render() {
    return React.createElement("div", { onMouseUp: this.handleMouseUp }, [
      React.createElement(OpenCard, {
        note: this.props.notes[this.state.open],
        handleOpen: this.handleOpen.bind(this),
        key: 1
      }),
      React.createElement(CardList, {
        notes: this.props.starredNotes,
        handleOpen: this.handleOpen.bind(this),
        peeking: this.state.peeking,
        key: 2
      }),
      React.createElement(Search, { key: 3, searchString: this.props.searchString }),
      React.createElement(CardList, {
        handleOpen: this.handleOpen.bind(this),
        searchResult: this.props.searchResult,
        notes: this.props.searchResult ? this.props.searchResultNotes : this.props.notes,
        peeking: this.state.peeking,
        key: 4
      })
    ]);
  }
}

class OpenCard extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleMouseup = this.handleMouseup.bind(this);    
  }

  handleMouseup(e) {
     e.stopPropagation();
  }

  handleClick(e) {
    this.props.handleOpen(this.props.note.id);
  }

  render() {
    if (this.props.note) {
      return React.createElement("div", { onMouseUp: this.handleMouseup, className: "card-open" }, [
        React.createElement(
          CardStar,
          { index: this.props.note.id, key: 1 },
          null
        ),
        React.createElement(
          "h2",
          { onClick: this.handleClick, className: "title", key: 2 },
          this.props.note.title
        ),
        React.createElement(reactMarkdown, {
          className: "content",
          key: 4,
          source: this.props.note.contentmarkdown
        })
      ]);
    }

    return null;
  }
}

class Search extends React.Component {
  constructor(props) {
    super(props);

    if (props.searchString) {
   this.state = { value: props.searchString};
    } else {
    this.state = { value: ""};     
    }
 

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    updateSearch(this.state.value);
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  componentWillReceiveProps(nextProps) {
      this.setState({
          value: nextProps.searchString
      })
  }

  render() {        
    return React.createElement(
      "form",
      { onSubmit: this.handleSubmit },
      React.createElement("input", {
        type: "search",
        onChange: this.handleChange,
        value: this.state.value
      })
    );
  }
}

class CardStar extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    updateStarred(this.props.index);
  }

  render() {
    return React.createElement(
      "div",
      { className: "card-star", onClick: this.handleClick },
      "★"
    );
  }
}

class CardTag extends React.Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);        
    }
    
    handleClick(e) {
      updateSearch(this.props.tagName);
    }    
    
    render() {
        let style = {
          backgroundColor: colorstops[tags.indexOf(this.props.tagName) % colorstops.length]
        };
        
        return React.createElement("span", {style: style, onClick: this.handleClick, className: "tag"}, this.props.tagName)
    }
}

class CardTags extends React.Component {

  render() {
    if (this.props.tags) {
      let children = this.props.tags.map((t, index) => {

        return React.createElement(
          CardTag,
          {
            key: index,
            tagName: t
          }
        );
      });

      return React.createElement(
        "div",
        { className: "card-tag-container" },
        children
      );
    } else {
      return null;
    }
  }
}

class Card extends React.Component {
  constructor(props) {
    super(props);

    this.handleMousedown = this.handleMousedown.bind(this);
    this.handleMouseup = this.handleMouseup.bind(this);
  }

  handleMousedown(e) {
    if (e.altKey) {
      this.props.handleOpen(this.props.note.id, true);

    }
  }

  handleMouseup() {
    if (!this.props.peeking) {
      this.props.handleOpen(this.props.note.id);
    }
  }

  render() {
    let propsClassnames = classNameBuilder({
      card: true,
      visible: !this.props.hidden,
      open: this.props.open
    });

    // let tokenMatch = "";
    //
    // if (this.props.note.searchResult && this.props.note.searchResult.score > 0) {
    //     tokenMatch = Object.keys(this.props.note.searchResult.matchData.metadata).toString();
    // }

    return React.createElement(
      "div",
      {
        className: propsClassnames
      },
      React.createElement(React.Fragment, null, [
        React.createElement(
          CardStar,
          { index: this.props.note.id, key: 1 },
          null
        ),
        React.createElement(
          "h2",
          {
            onMouseUp: this.handleMouseup,
            onMouseDown: this.handleMousedown,
            className: "title",
            key: 2
          },
          this.props.note.title
        ),
        React.createElement(CardTags, { tags: this.props.note.tag, key: 3 }),
        React.createElement(
          "div",
          { className: "content", key: 4 },
          this.props.note.content
        )
      ])
    );
  }
}

class CardList extends React.Component {
  render() {
    let children = this.props.notes.map((n, index) => {
      let childProps = {
        note: n,
        key: index,
        handleOpen: this.props.handleOpen,
        peeking: this.props.peeking
      };

      if (this.props.searchResult) {
        childProps.hidden = !n.searchResult || n.searchResult.score === 0;
      }

      return React.createElement(Card, childProps);
    });

    return React.createElement("div", { className: "card-list" }, children);
  }
}

let notes;
let idx;
let pastResult;
let searchResult = false;
let tags = [];

let colorstops = [
  "hsl(10, 100%, 40%)",
  "hsl(10, 100%, 50%)",
  "hsl(10, 100%, 60%)",
  "hsl(10, 100%, 70%)",
  "hsl(10, 100%, 80%)",
  "hsl(10, 100%, 90%)",
  "hsl(80, 100%, 40%)",
  "hsl(80, 100%, 50%)",
  "hsl(80, 100%, 60%)",
  "hsl(80, 100%, 70%)",
  "hsl(80, 100%, 80%)",
  "hsl(80, 100%, 90%)",
  "hsl(170, 100%, 40%)",
  "hsl(170, 100%, 50%)",
  "hsl(170, 100%, 60%)",
  "hsl(170, 100%, 70%)",
  "hsl(170, 100%, 80%)",
  "hsl(170, 100%, 90%)",
  "hsl(215, 100%, 40%)",
  "hsl(215, 100%, 50%)",
  "hsl(215, 100%, 60%)",
  "hsl(215, 100%, 70%)",
  "hsl(215, 100%, 80%)",
  "hsl(215, 100%, 90%)"
];

const noteById = function(id) {
  return notes.find(n => {return n.id == id});
}

const renderAll = function(searchString = "", searchResultNotes = false) {
  let starredNotes = notes.filter(n => {
    return n.starred;
  });

  ReactDOM.render(
    React.createElement(App, {
      searchResult: searchResult,
      searchString: searchString,
      starredNotes: starredNotes,
      searchResultNotes: searchResultNotes,
      notes: notes
    }),
    document.getElementById("root")
  );
};

const updateStarred = function(index) {
  let note = noteById(index);

  note.starred = !note.starred;

  renderAll();
};

const updateSearch = function(searchString) {
  if (searchString !== "") {
    searchResult = true;
    let result = idx.search(searchString);

    console.log(idx);
    console.log(result);

    if (pastResult) {
      pastResult.forEach(r => {

        noteById(r.ref).searchResult = { score: 0 };
      });
    }

    let searchResultNotes = result.map( r => {
      let n = noteById(r.ref);
      n.searchResult = r;
      return n;

    });

    pastResult = result;

      searchResultNotes.sort((a, b) => {
        if (a.searchResult.score > b.searchResult.score) {
          return -1;
        } else if ( a.searchResult.score < b.searchResult.score ) {
          return 1;
        }

        return 0;
      });
  
      renderAll(searchString, searchResultNotes);

  } else {
    searchResult = false;
    notes.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        } else if ( a.title > b.title ) {
          return 1;
        }

        return 0;
    });

      renderAll(searchString);
  }


};

const reqListener = function() {
  notes = JSON.parse(this.response)["en-export"].note;

  notes.forEach((n, index) => {
    n.id = index;
    n.searchResult = { score: 0 };

    n.tag.forEach(t => {
      if (tags.indexOf(t) === -1) {
        tags.push(t);
      }
    });
  });

  console.log(tags);

  // Build search index
  idx = lunr(function() {
    this.ref("id");
    this.field("title");
    this.field("content");
    this.field("tag");

    notes.forEach(function(n) {
      this.add(n);
    }, this);
  });


  // Check for URL search string
  const searchParams = new URLSearchParams(window.location.search.substring(1));

  if (searchParams.has("q")) {
    
    updateSearch(searchParams.get("q"));
  } else {
  renderAll();   
  }

 
};

const oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.open("GET", "output.json");
oReq.send();
