import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import axios from 'axios';

let key = 0;

class Category extends Component {
  constructor(props) {
    super(props);
    this.state = { products: [] };
  }

  async componentDidMount() {
    const pathName = this.props.location.pathname;
    const response = await axios.get(`/api/v1/${pathName}`);
    this.setState({ products: response.data });
  }

  getProductElements(products) {
    return products.map(product => {
      key += 1;
      return <li
        key={key}>
        <ul style={{
          textAlign: 'left',
          marginBottom: '20px',
        }}>
          {['itemId', 'name', 'categoryPath'].map(productProperty => (
            <li key={`${productProperty}-${key}`}>
              <b>{productProperty}:</b> {product[productProperty]}
            </li>
          ))}
        </ul>
      </li>
    });
  }

  render() {
    let productElements = <li>...loading products</li>;
    const { products } = this.state;
    if (products.length !== 0) {
      productElements = this.getProductElements(products);
    }

    return (
      <div>
        <ul>
          {productElements}
        </ul>

        <Link
          to='/'
        >
          Search Products
        </Link>
      </div>
    );
  }
}

export default Category;
