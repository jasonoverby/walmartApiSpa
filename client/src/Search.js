import React, { Component } from 'react';
import { Link } from 'react-router-dom'

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = { category: '' };
  }

  handleChange = (e) => {
    this.setState({ category: e.target.value });
  }

  render() {
    const { category } = this.state;

    return (
      <form>
        <label htmlFor="category">
          <h1>Enter your query</h1>
          <input
            id="category"
            type="text"
            value={category}
            onChange={this.handleChange}
          />
        </label>
        <Link
          to={{
            pathname: this.state.category,
          }}
        >
          Search
        </Link>
      </form>
    );
  }
}

export default Search;
