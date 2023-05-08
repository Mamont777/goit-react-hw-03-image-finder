import React, { Component } from 'react';
import { ToastContainer, Slide, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Container } from './App.styled';
import Searchbar from './Searchbar';
import ImageGallery from './ImageGallery';
import Loader from './Loader';
import Button from './Button';
import Modal from './Modal';
import * as API from '../services/api.js';

export class App extends Component {
  state = {
    page: 1,
    query: '',
    items: [],
    largeImageURL: '',
    error: null,
    isLoading: false,
    isModalOpen: false,
  };

  componentDidUpdate(_, { page, query }) {
    if (page !== this.state.page || query !== this.state.query) {
      this.fetchImages(this.state.page, this.state.query);
    }
  }

  toggleModal = (url = '') => {
    this.setState(({ isModalOpen }) => ({
      largeImageURL: url,
      isModalOpen: !isModalOpen,
    }));
  };

  handleSubmit = query => {
    this.setState({ query, page: 1, items: [] });
  };

  handleLoadMore = () => {
    this.setState(prevState => ({
      page: prevState.page + 1,
    }));
  };

  fetchImages = async (page, query) => {
    try {
      this.setState({ isLoading: true });
      const images = await API.loadImage(query, page);

      this.setState(prevState => ({
        items: [...prevState.items, ...images],
        isLoading: false,
      }));
      if (images.length === 0) {
        return toast.warning(
          "Sorry, we can't find anything for your request. Please, enter another request"
        );
      }
    } catch (error) {
      this.setState({ error: error.message });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { items, isLoading, error, largeImageURL, isModalOpen } = this.state;
    return (
      <Container>
        <Searchbar onSubmit={this.handleSubmit} isLoading={isLoading} />
        {error && <p>{error}</p>}
        {items.length > 0 && (
          <ImageGallery items={items} onClick={this.toggleModal} />
        )}
        {items.length > 0 && (
          <Button onLoadMore={this.handleLoadMore} isLoading={isLoading} />
        )}
        <ToastContainer transition={Slide} />
        {isLoading && <Loader />}
        {isModalOpen && (
          <Modal onClose={this.toggleModal} url={largeImageURL} />
        )}
      </Container>
    );
  }
}
