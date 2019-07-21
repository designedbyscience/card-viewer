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
      open: false,
      grid: true,
      focussedNote: 1
    };


    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keyup", this.handleKeyUp);
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  showHelp() {
    document.querySelector("#help").style.display = "block";
  }

  hideHelp() {
    document.querySelector("#help").style.display = "none";
  }

  handleToggleGridType(){
    this.setState({
      grid: !this.state.grid
    });
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
      focussedNote: this.state.open !== id ? id : this.state.focussedNote,
      starredOpen: app.noteById(id).starred,
      peeking: peeking
    });
  }

  handleKeyDown(e) {
    if ((e.code == "MetaLeft" || e.code == "MetaRight") && !this.activeTimer) {
      // set timer that will be cancelled by keyup
      this.activeTimer = true;
      this.helpTimer = setInterval(this.showHelp, 3000);
    }

    if (this.state && this.state.open !== false && (e.code == "ArrowDown" || e.key == "UIKeyInputDownArrow")) {
        e.preventDefault(); 
    }
  }

  handleKeyUp(e) {
    clearInterval(this.helpTimer);
    this.activeTimer = false;
    this.hideHelp();

    if (e.code == "KeyS" && e.altKey) {
      if (window.getSelection().toString() != "") {
        app.updateSearch(window.getSelection().toString());
      }
    } else if (e.code == "Escape") {
      this.setState({ open: false });
    } else if (e.code == "KeyG") {
      this.setState({
        grid: !this.state.grid
      })
    }

    const getNextId = function(list, id) {
      let currentIndex = list.findIndex(n => {
        return id == n.id;
      });
      return currentIndex == 0
        ? list[list.length - 1].id
        : list[currentIndex - 1].id;
    };

    const getPreviousId = function(list, id) {
      let currentIndex = list.findIndex(n => {
        return id == n.id;
      });
      return currentIndex == list.length - 1
        ? list[0].id
        : list[currentIndex + 1].id;
    };

    const updateCardOpenState = function(directionFunction) {
      if (this.state.starredOpen) {
        this.setState({
          open: directionFunction(this.props.starredNotes, this.state.open)
        });
      } else if (this.props.searchResultNotes) {
        this.setState({
          open: directionFunction(this.props.searchResultNotes, this.state.open)
        });
      } else {
        this.setState({
          open: directionFunction(this.props.notes, this.state.open),
          focussedNote: directionFunction(this.props.notes, this.state.open)
        });
      }
    }.bind(this);

    if (this.state && this.state.open !== false) {
      if (e.code == "ArrowLeft" || e.key == "UIKeyInputLeftArrow") {
        updateCardOpenState(getNextId);
      } else if (e.code == "ArrowRight" || e.key == "UIKeyInputRightArrow") {
        updateCardOpenState(getPreviousId);
      } else if (e.code == "ArrowUp" || e.key == "UIKeyInputUpArrow") {
        app.updateStarred(this.state.open);
      } else if (e.code == "ArrowDown" || e.key == "UIKeyInputDownArrow") {
        e.preventDefault();
        this.setState({ open: false });
      }
    }

    if (this.state && this.state.open === false) {
      if (e.code == "ArrowLeft" || e.key == "UIKeyInputLeftArrow") {
        this.setState({
          focussedNote: getNextId(this.props.notes, this.state.focussedNote)
        });
      } else if (e.code == "ArrowRight" || e.key == "UIKeyInputRightArrow") {
        this.setState({
          focussedNote: getPreviousId(this.props.notes, this.state.focussedNote)
        });
      } else if (e.code == "ArrowUp" || e.key == "UIKeyInputUpArrow") {
        this.setState({open: this.state.focussedNote});
      } 
    }

  }

  render() {

    let gridListComponent;

    let gridListProps = {
      handleOpen: this.handleOpen.bind(this),
      searchResult: this.props.searchResult,
      focussedNote: this.state.focussedNote,
      notes: this.props.searchResult
        ? this.props.searchResultNotes
        : this.props.notes,
      peeking: this.state.peeking,
      key: 4
    };

    if (this.state.grid) {
      gridListComponent = React.createElement(CardList, gridListProps);
    } else {
      gridListComponent = React.createElement(Table, gridListProps);
    }

    return React.createElement("div", { onMouseUp: this.handleMouseUp }, [
      React.createElement(OpenCard, {
        note: this.state.open ? app.noteById(this.state.open) : false,
        handleOpen: this.handleOpen.bind(this),
        key: 1
      }),
      React.createElement(CardList, {
        notes: this.props.starredNotes,
        handleOpen: this.handleOpen.bind(this),
        peeking: this.state.peeking,
        key: 2,
        className: "starredcards"
      }),
      React.createElement(Search, {
        key: 3,
        searchString: this.props.searchString,
        queue: this.props.queue
      }),
      React.createElement(GridTableSwitcher, {
        handleGridSwitch: this.handleToggleGridType.bind(this)
      }),
      React.createElement(SortChooser, {sortOptions: this.props.sortOptions, key: 7}),
      gridListComponent      
    ]);
  }
}

class GridTableSwitcher extends React.Component {
  render() {
    return React.createElement("div", {}, [
      React.createElement("button", {onClick: this.props.handleGridSwitch, key: 1}, "Grid"),
      React.createElement("button", {onClick: this.props.handleGridSwitch, key: 2}, "List"),
    ]);
  }
}

class SortChooser extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(sortName) {
    app.updateSort(sortName);
  }

  render() {
    let children = this.props.sortOptions.map((so, index) => {
      return React.createElement("button", {onClick: this.handleClick.bind(this, so.name), key: index}, so.name);

    });

    return React.createElement("div", {}, children)
  }
}

class TableRow extends React.Component {
  constructor(props) {
    super(props);

    this.block = React.createRef();
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {    
      this.props.handleOpen(this.props.note.id, true);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (this.props.hasFocus != nextProps.hasFocus || this.props.peeking != nextProps.peeking)
  }

  componentDidUpdate(prevProps, prevState) {
    this.block.current.scrollIntoView({"block": "nearest"});
  }

  render () {
    let tagList = this.props.note.tag.map( (t) => {
      return React.createElement(CardTag, {tagName: t})
    })



    let classNames = {};

    
    classNames["focus"] = this.props.hasFocus;
    


    return React.createElement("tr", {ref: this.block, className: classNameBuilder(classNames)}, [
      React.createElement("td", {}, React.createElement(CardStar, { index: this.props.note.id})),
      React.createElement("td", { onClick: this.handleClick}, this.props.note.title),
      React.createElement("td", {}, tagList)
      ]);
  }
}

class Table extends React.Component {
  render () {
    let focussedNote = this.props.focussedNote;
    let children = this.props.notes.map((n, index) => {
      let childProps = {
        hasFocus: focussedNote === n.id,
        note: n,
        key: index,
        handleOpen: this.props.handleOpen
      };

      return React.createElement(TableRow, childProps);
    });

    // let classNames = {
    //   cardlist: true
    // };

    // if (this.props.className) {
    //   classNames[this.props.className] = true;
    // }

    return React.createElement(
      "table",
      {  },
      [
        React.createElement("thead", {}, 
          React.createElement("tr", {}, [
            React.createElement("th", {}),
            React.createElement("th", {}, "Recipe"),
            React.createElement("th", {}, "Tags")
          ])
        ),
        React.createElement("tbody", {}, children)
      ]
    );
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
      return React.createElement(
        "div",
        { onMouseUp: this.handleMouseup, className: "card-open" },
        [
          React.createElement(
            "div",
            {className: "card-title-container"},
            [
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
              React.createElement(
                "a",
                {onClick: this.handleClick},
                "×"
              )
            ]
          ),

          React.createElement(reactMarkdown, {
            className: "content",
            key: 4,
            source: this.props.note.content
          })
        ]
      );
    }

    return null;
  }
}

class SearchQueueItem extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({ linethrough: true });

    this.props.handleClick(this.props.content);
  }

  render() {
    return React.createElement(
      "li",
      {
        className: this.state && this.state.linethrough ? "done" : "",
        onClick: this.handleClick
      },
      this.props.content
    );
  }
}

class SearchQueue extends React.Component {
  render() {
    let queueElements = null;

    if (this.props.queue) {
      queueElements = this.props.queue.map(q => {
        return React.createElement(SearchQueueItem, {
          content: q,
          handleClick: this.props.handleItemClick
        });
      });
    }

    return React.createElement(
      "ul",
      { className: "searchqueue" },
      queueElements
    );
  }
}

class Search extends React.Component {
  constructor(props) {
    super(props);

    if (props.searchString) {
      this.state = { value: props.searchString };
    } else {
      this.state = { value: "" };
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    app.updateSearch(this.state.value);
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  handleItemClick(q) {
    app.updateSearch(q);
  }

  handlePaste(e) {
    let clipboardText = e.clipboardData.getData("text");
    let queue;

    if (clipboardText && clipboardText.match(/\n|\r/)) {
      e.stopPropagation();
      e.preventDefault();
      queue = clipboardText.split("\n");

      app.updateQueue(queue);
      app.updateSearch(queue[0]);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.searchString) {
      this.setState({
        value: nextProps.searchString
      });
    }    
  }

  render() {
    return React.createElement("div", {}, [
      React.createElement(SearchQueue, {
        queue: this.props.queue,
        handleItemClick: this.handleItemClick
      }),
      React.createElement(
        "form",
        { onSubmit: this.handleSubmit },
        React.createElement("input", {
          type: "search",
          onChange: this.handleChange,
          onPaste: this.handlePaste,
          value: this.state.value
        })
      )
    ]);
  }
}

class CardStar extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    app.updateStarred(this.props.index);
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

    this.colorstops = [
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

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    app.updateSearch(this.props.tagName);
  }

  render() {
    let style = {
      backgroundColor: this.colorstops[
        app.tags.indexOf(this.props.tagName) % this.colorstops.length
      ]
    };

    return React.createElement(
      "span",
      { style: style, onClick: this.handleClick, className: "tag" },
      this.props.tagName
    );
  }
}

class CardTags extends React.Component {
  render() {
    if (this.props.tags) {
      let children = this.props.tags.map((t, index) => {
        return React.createElement(CardTag, {
          key: index,
          tagName: t
        });
      });

      children.push(this.props.children);

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

    this.block = React.createRef();
    this.handleMousedown = this.handleMousedown.bind(this);
    this.handleMouseup = this.handleMouseup.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (this.props.hasFocus != nextProps.hasFocus || this.props.peeking != nextProps.peeking)
  }

  componentDidUpdate(prevProps, prevState) {
    this.block.current.scrollIntoView({"block": "nearest"});
  }

  handleMousedown(e) {
    if (e.altKey) {
      this.props.handleOpen(this.props.note.id, true);
    }
  }

  handleMouseup(e) {
    if (!this.props.peeking && e.button === 0) {
      this.props.handleOpen(this.props.note.id);
    }
  }

  handleTouchEnd() {
    this.props.handleOpen(this.props.note.id, true);
  }

  render() {

    let classNames = {
      card: true,
      visible: true
    };

    if (this.props.hasFocus) {
      classNames["focus"] = true;
    }

    return React.createElement(
      "div",
      {
        className: classNameBuilder(classNames),
        ref: this.block
      },
      [
        React.createElement(
          "h2",
          {
            onMouseUp: this.handleMouseup,
            onMouseDown: this.handleMousedown,
            onTouchEnd: this.handleTouchEnd,
            className: "title",
            key: 2
          },
          this.props.note.title
        ),
        React.createElement(CardTags, { tags: this.props.note.tag, key: 3}, React.createElement(
          CardStar,
          { index: this.props.note.id},
          null
        )),
        React.createElement(
          "div",
          { className: "content", key: 4 },
          this.props.note.content
        )
      ]
    );
  }
}

class CardList extends React.Component {
  render() {
    let focussedNote = this.props.focussedNote;
    let children = this.props.notes.map((n, index) => {
      let childProps = {
        hasFocus: focussedNote === n.id,
        note: n,
        key: index,
        handleOpen: this.props.handleOpen,
        peeking: this.props.peeking
      };

      return React.createElement(Card, childProps);
    });

    let classNames = {
      cardlist: true
    };

    if (this.props.className) {
      classNames[this.props.className] = true;
    }

    return React.createElement(
      "div",
      { className: classNameBuilder(classNames) },
      children
    );
  }
}

let app;

class Application {
  constructor(notes) {
    this.notes = notes;
    this.tags = [];

    this.notes.forEach((n, index) => {
      n.id = index + 1;
      n.searchResult = { score: 0 };

      n.tag.forEach(t => {
        if (this.tags.indexOf(t) === -1) {
          this.tags.push(t);
        }
      });
    });

    let tempNotes = this.notes;

    this.idx = elasticlunr(function() {
      this.setRef("id");
      this.addField("title");
      this.addField("content");
      this.addField("tag");
    });

    tempNotes.forEach( n => {
      this.idx.addDoc(n);
    });

    this.searchResult = false;

    this.sortOptions = [
      {
        name: "title",
        compareFunction: (a,b) => {

          if (a.title > b.title) {
            return 1
          } else if (a.title === b.title) {
            return 0
          } else {
            return -1
          }
        }
      },
      {
        name: "id",
        compareFunction: (a,b) => {
          return a.id - b.id;
        }
      },
      {
        name: "tag",
        compareFunction: (a,b) => {
          // Sort tag lists by name
          a.tag.sort();
          b.tag.sort();
          // Sort by joined string
          let joinedA = a.tag.join();
          let joinedB = b.tag.join();

          if (joinedA < joinedB) {
            return 1;
          } else if (joinedA == joinedB) {
            return 0;
          } else {
            return -1;
          }
        }
      }
    ];
  }

  noteById(id) {
    return this.notes.find(n => {
      return n.id == id;
    });
  }

  noteByTitle(title) {
    return this.notes.find(n => {
      return n.title == title;
    })
  }

  updateSort(sortName) {
    let so = this.sortOptions.find((s) => {return sortName === s.name});
    this.notes.sort(so.compareFunction);
    this.renderAll();
  }

  updateStarred(index) {
    let note = this.noteById(index);

    note.starred = !note.starred;

    this.renderAll();
  }

  updateQueue(queue) {
    this.queue = queue;
    this.renderAll();
  }

  updateSearch(searchString) {
    if (searchString !== "") {
      this.searchResult = true;
      let result = this.idx.search(searchString);

      if (this.pastResult) {
        this.pastResult.forEach(r => {
          this.noteById(r.ref).searchResult = { score: 0 };
        });
      }

      this.searchResultNotes = result.map(r => {
        let n = this.noteById(r.ref);
        n.searchResult = r;
        return n;
      });

      this.pastResult = result;

      this.searchResultNotes.sort((a, b) => {
        if (a.searchResult.score > b.searchResult.score) {
          return -1;
        } else if (a.searchResult.score < b.searchResult.score) {
          return 1;
        }

        return 0;
      });

      this.searchString = searchString;
      this.renderAll();
    } else {
      this.searchResult = false;
      this.notes.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        } else if (a.title > b.title) {
          return 1;
        }

        return 0;
      });

      this.searchString = searchString;
      this.renderAll();
    }
  }

  renderAll() {
    let starredNotes = this.notes.filter(n => {
      return n.starred;
    });

    ReactDOM.render(
      React.createElement(App, {
        searchResult: this.searchResult,
        searchString: this.searchString,
        starredNotes: starredNotes,
        searchResultNotes: this.searchResultNotes,
        sortOptions: this.sortOptions,
        queue: this.queue,
        notes: this.notes
      }),
      document.getElementById("root")
    );
  }
}

const reqListener = function() {
  app = new Application(JSON.parse(this.response));

  // Check for URL search string
  const searchParams = new URLSearchParams(window.location.search.substring(1));

  if (searchParams.has("q")) {
    app.updateSearch(searchParams.get("q"));
  } else if (searchParams.has("queue")) {
    app.updateQueue(searchParams.get("queue")).split("\n");
  } else if (searchParams.has("id")) {
    app.openCard(app.noteByTitle(searchParams.get("id")))
  } else {
    app.renderAll();
  }
};

const oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.open("GET", dataURL);

oReq.send();
