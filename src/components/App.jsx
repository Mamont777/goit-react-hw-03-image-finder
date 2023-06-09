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
    totalHits: 0,
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
      const { images, totalHits } = await API.loadImage(query, page);

      if (images.length === 0) {
        return toast.warning(
          "Sorry, we can't find anything for your request. Please, enter another request"
        );
      }
      this.setState(prevState => ({
        items: [...prevState.items, ...images],
        totalHits,
        showBtn: this.state.page < Math.ceil(totalHits / 12),
      }));
      if (totalHits) {
        toast.success(`Found ${totalHits} images`);
      }
    } catch (error) {
      this.setState({ error: error.message });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { items, isLoading, error, largeImageURL, isModalOpen, showBtn } =
      this.state;
    return (
      <Container>
        <Searchbar onSubmit={this.handleSubmit} isLoading={isLoading} />
        {error && <p>{error}</p>}
        {items.length > 0 && (
          <ImageGallery items={items} onClick={this.toggleModal} />
        )}
        {showBtn && (
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
