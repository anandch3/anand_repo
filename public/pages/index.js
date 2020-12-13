import Head from 'next/head'
import { useState, useEffect } from 'react'
import DetailsPopup from '../components/detailsPopup'
import Slider from "react-slick";
import axios from "axios";
import Link from 'next/link';
import { API_BASE_URL } from '../config';

export default function Home() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hideReadMorePopUp, setHideReadMorePopUp] = useState(true);

  const [categories, setCategories] = useState([]);
  const [catSubcategories, setCatSubcategories] = useState([]);

  const [showFullAboutUs, setShowFullAboutUs] = useState(false);

  var settings = {
    dots: true,
    infinite: false,
    autoplay: false,
    responsive: [
      {
        breakpoint: 2000,
        settings: {
          slidesToShow: 4,
        }
      },
      {
        breakpoint: 1500,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  useEffect(async () => {

    let getCategories = await axios.get(`${API_BASE_URL}category/active`);

    let categoriesGot;

    if (getCategories.status === 200) {
      categoriesGot = getCategories.data.categories;

      var i;
      for (i = 0; i < categoriesGot.length; i++) {
        var tempCatId = categoriesGot[i]._id;

        let subcategoriesGot = await axios.get(`${API_BASE_URL}subcategory/category/active/${tempCatId}`);
        categoriesGot[i]['subcategories'] = subcategoriesGot.data.subcategory;
      }
    }
    setCategories(categoriesGot);
  }, []);

  useEffect(() => {
  }, [categories]);

  const [cartItemCount, setCartItemCount] = useState('0');

  useEffect(() => {
    getCartCount();
  }, []);

  const getCartCount = () => {
    const cartProducts = JSON.parse(localStorage.getItem('cart') || "[]");
    const cartProductsCount = cartProducts.length;
    setCartItemCount(cartProductsCount);
  }

  useEffect(() => {
  }, [cartItemCount]);

  return (
    <>
      <Head>
        <title>Country &amp; Khadak</title>
        <link rel="icon" href="/favicon.ico" />
        <script src="/js/jquery-3.3.1.min.js"></script>
        <script src="/js/scripts.js"></script>
        <link rel="stylesheet" type="text/css" charSet="UTF-8" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" />
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />
      </Head>

      <div className="header">
        <div className="headerMain">
          <div className="headerLogo">
            <div className="headerLogoImage">
              <img src="images/logo.png" className="headerLogoImg" />
            </div>
          </div>
          <div className="headerNav">
            <div className="headerNavMain">
              {
                categories.map(function (category, i) {
                  return (
                    <Link href={`/products/category/${category._id}`} key={category._id}>
                      <div className="headerNavSingle">
                        <div className="headerNavSingleInner">
                          <img src={`${API_BASE_URL}${category.image_url}`} className="headerNavSingleImg" />
                        </div>
                      </div>
                    </Link>
                  )
                })
              }
              <Link href={`/cart`}>
                <div className="headerNavSingle">
                  <div className="headerNavSingleInner">
                    <i className="fas fa-cart-arrow-down headerNavSingleIco"></i>
                  </div>
                </div>
              </Link>
              <Link href="/">
                <div className="headerNavSingle">
                  <div className="headerNavSingleInner">
                    <i className="fas fa-home headerNavSingleIco" />
                  </div>
                </div>
              </Link>
            </div>
            <div className="headerNavSearch">
              <div className="headerNavSearchMain">
                <div className="headerNavSearchInput">
                  <input type="text" className="headerNavSearchInputTxt" placeholder="Enter Here To Search Products" />
                </div>
                <div className="headerNavSearchButton">
                  <i className="fas fa-arrow-right headerNavSearchButtonIco"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="banner">
        <Link href="/products/category/5fc9d4b49d889b78c9a37294">
          <div className="bannerInner">
            <img src="images/banner-1.jpg" className="bannerImg" />
          </div>
        </Link>
      </div>
      <div className="about-us">
        <div className="about-us-inner">
          <div className="about-us-heading">
            <p className="about-us-heading-text">Welcome To Country &amp; Khadak!</p>
          </div>
          <div className="about-us-description">
            <p className="about-us-description-text">Finally, the wait for organically reared livestock meat is over. It's the idea of two Farmers’ daughters graduated from Agriculture University Bangalore who are into real farming. Knowing the true need for the best quality mutton, chicken and fish, they have turned the idea into a reality.</p>
            <p className="about-us-description-text">Country &amp; Khadak is not like other meat suppliers who already exist in the market. We rear own livestock through organic ways to ensure good quality meat is supplied to our customers. Country and Khadak is a combination of both 'Naati' (Country) meat of sheep/goat and Kadaknath chicken.</p>

            {
              showFullAboutUs === false
                ? <p className="readMoreAction" onClick={(e) => { setShowFullAboutUs(true) }}>Read More</p>
                : <></>
            }

            {
              showFullAboutUs === true
                ?
                <>
                  <p className="about-us-description-text">Having understood the needs of our customers, we are bringing to Bengaluru the most exquisite Kadaknath chicken, which now the talk of our country.</p>
                  <p className="about-us-description-text">We are here to serve you with best quality chicken, mutton, fish &amp; sea food and of course the eggs which includes Naati chicken eggs, Farm chicken eggs and Kadaknath eggs. Country &amp; Kadak does not believe in using steroids, artificial feeds, medicines and antibiotics to its livestock. They are naturally fed and reared in open fields and farms at Tumakuru and are later processed at the state-of-art processing unit located in Hosakote from where the fresh meat is supplied to our customers and to our outlets.</p>
                </>
                : <></>
            }

          </div>
        </div>
      </div>
      <div className="products">
        <div className="products-inner">
          <div className="products-heading">
            <p className="products-heading-text">products by category</p>
          </div>
          {
            categories.map(function (category, i) {

              if (category.subcategories.length != 0) {
                return (
                  <div className="products-category" key={category._id}>
                    <div className="products-category-inner">
                      <div className="products-category-indicator">
                        <div className="products-category-indicator-inner">
                          <img src={`${API_BASE_URL}${category.image_url}`} className="products-category-indicator-img" />
                        </div>
                      </div>
                      <div className="products-category-lists">
                        <div className="products-category-lists-inner">
                          <Slider {...settings}>
                            {
                              category.subcategories.map(function (subcategory, i) {
                                return (
                                  <div className="products-category-item" key={subcategory._id}>
                                    <Link href={`products/${category._id}/${subcategory._id}`}>
                                      <div className="products-category-item-image">
                                        <img src={`${API_BASE_URL}${subcategory.image_url}`} className="products-category-item-img" />
                                      </div>
                                    </Link>

                                    <div className="products-category-item-details">
                                      <div className="products-category-item-details-heading">
                                        <p className="products-category-item-details-heading-txt">{subcategory.name}</p>
                                      </div>
                                      <div className="products-category-item-details-description">
                                        <p className="products-category-item-details-description-txt" onClick={(e) => {
                                          setName(subcategory.name);
                                          setDescription(subcategory.description);
                                          setHideReadMorePopUp(false);
                                        }}>{subcategory.description}</p>
                                      </div>
                                      <div className="products-category-item-details-action">
                                        <Link href={`products/${category._id}/${subcategory._id}`}>
                                          <p className="products-category-item-details-action-txt">buy now</p>
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            }
                          </Slider>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              else {
                return (
                  <></>
                )
              }
            })
          }
        </div>
      </div>
      <div className="our-vision">
        <div className="our-vision-inner">
          <div className="our-vision-indicator">
            <div className="our-vision-indicator-inner">
              <p className="our-vision-indicator-text">Our Vision</p>
            </div>
            <div className="our-vision-indicator-quote">
              <img src="images/quote.png" className="our-vision-indicator-quote-ico" />
            </div>
          </div>
          <div className="our-vision-content">
            <div className="our-vision-content-inner">
              <p className="our-vision-content-text">"Country &amp; Khadak’s vision and mission are no different. We are here
              to provide our customers with best quality mutton, chicken and fish not only satiate their tickling
                taste buds but also to ensure they are healthy and safe."</p>
            </div>
          </div>
        </div>
      </div>
      <div className="store-gallery">
        <div className="store-gallery-single">
          <div className="store-gallery-single-image">
            <img src="images/shop-1.jpg" className="store-gallery-single-img" />
          </div>
        </div>
        <div className="store-gallery-single">
          <div className="store-gallery-single-image">
            <img src="images/shop-2.jpg" className="store-gallery-single-img" />
          </div>
        </div>
        <div className="store-gallery-single">
          <div className="store-gallery-single-image">
            <img src="images/shop-3.jpg" className="store-gallery-single-img" />
          </div>
        </div>
        <div className="store-gallery-single">
          <div className="store-gallery-single-image">
            <img src="images/shop-4.jpg" className="store-gallery-single-img" />
          </div>
        </div>
      </div>
      <div className="contact-us">
        <div className="contact-us-inner">
          <div className="contact-us-details">
            <div className="contact-us-details-inner">
              <div className="contact-us-details-left">
                <div className="contact-us-details-left-heading">
                  <p className="contact-us-details-left-heading-text">country &amp; khadak</p>
                </div>
                <div className="contact-us-details-left-description">
                  <p className="contact-us-details-left-description-text">Country &amp; Khadak has commenced its services
                  in Koramangala, Bengaluru from 27th Nov 2020. You can now taste your favourite
                    Khadaknath in Namma City.</p>
                </div>
              </div>
              <div className="contact-us-details-contact">
                <div className="contact-us-details-contact-heading">
                  <p className="contact-us-details-contact-heading-text">contact details</p>
                </div>
                <div className="contact-us-details-contact-description">
                  <p className="contact-us-details-contact-description-text">+91 9108342799</p>
                  <p className="contact-us-details-contact-description-text">support@countryandkhadak.com</p>
                </div>
              </div>
            </div>
          </div>
          <div className="contact-us-copyright-logo">
            <div className="contact-us-copyright-logo-inner">
              <div className="contact-us-logo">
                <div className="contact-us-logo-inner">
                  <img src="images/logo.png" className="contact-us-logo-img" />
                </div>
              </div>
              <div className="contact-us-copyright">
                <p className="contact-us-copyright-text">Copyright © 2020. All Rights Reserved Country &amp;
                  Khadak.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        hideReadMorePopUp === false
          ?
          <DetailsPopup
            name={name}
            description={description}
            clickedHidePopUp={(e) => {
              setHideReadMorePopUp(true);
            }}
          />
          :
          <></>
      }

      <div className="cartFavIcon">
        {
          cartItemCount != '0'
            ?
            <div className="cartFavIconBubble">
              <p className="cartFavIconBubbleTxt">{cartItemCount}</p>
            </div>
            : <></>
        }
        <Link href="/cart">
          <div className="cartFavIconInner">
            <i className="fas fa-cart-arrow-down cartFavIconIco"></i>
          </div>
        </Link>
      </div>

    </>
  )
}
