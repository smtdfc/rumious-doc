import { Fragment, createApp } from '@rumious/core';
import initRouter from './router';
import Navbar from '@components/Navbar';
import Footer from '@components/Footer';
import '@services/content';
import './styles/index.css';

const rootElement = document.getElementById('app');
if (!rootElement) {
  throw new Error('Cannot find root element ');
}

const app = createApp({
  root: rootElement,
});

const router = initRouter(app);
app.setRootLayout(
  <Fragment>
    <Navbar />
    <div class="container">{router.rootSlot}</div>
    <Footer />
    <div
      class="overlay"
      id="mainOverlay"
      style="opacity:0;pointer-events:none;"
    ></div>
  </Fragment>,
);

app.start();
