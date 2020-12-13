import Head from 'next/head'
import { useState, useEffect } from 'react'
import axios from "axios";
import Link from 'next/link';
import { API_BASE_URL } from '../../../config';
import { useRouter } from 'next/router';
import DetailsPopup from '../../../components/detailsPopup';

const Subcategories = () => {
    const router = useRouter()
    const { id } = router.query;

    const [subcategories, setSubCategories] = useState([]);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState([]);
    const [hideReadMorePopUp, setHideReadMorePopUp] = useState(true);
    const [categories, setCategories] = useState([]);
    const [cartItemCount, setCartItemCount] = useState('0');

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

    useEffect(async () => {
        const subCategoryId = id;
        let getSubCategories = await axios.get(`${API_BASE_URL}subcategory/category/active/${subCategoryId}`);
        if (getSubCategories.status === 200) {
            setSubCategories(getSubCategories.data.subcategory);
        }
    }, [id]);

    useEffect(() => {
    }, [subcategories]);

    useEffect(async () => {
        const subCategoryId = id;
        if (id != undefined) {
            let getCategory = await axios.get(`${API_BASE_URL}category/${subCategoryId}`);
            if (getCategory.status === 200) {
                setCategory(getCategory.data.category);
            }
        }
    }, [id]);

    useEffect(() => {
    }, [category]);

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
            <div className="headerPages">
                <div className="headerMain">
                    <a href="/">
                        <div className="headerLogo">
                            <div className="headerLogoImage">
                                <img src="../images/logo.png" className="headerLogoImg" />
                            </div>
                        </div>
                    </a>
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

            <div className="pageContent">
                <div className="pageContentInner">
                    <div className="pageContentHeading">
                        <p className="pageContentHeadingTxt">{category.name}</p>

                        <div className="pageContentMain">
                            <ul className="pageContentList">
                                {
                                    subcategories.map(function (subcategory, i) {
                                        return (
                                            <li className="pageContentListSingle" key={subcategory._id}>
                                                <Link href={`/products/${category._id}/${subcategory._id}`}>
                                                    <div className="pageContentListSingleImage clickable">
                                                        <img src={`${API_BASE_URL}${subcategory.image_url}`} className="pageContentListSingleImg" />
                                                    </div>
                                                </Link>
                                                <div className="pageContentListSingleDetails">

                                                    <div className="pageContentListSingleDetailsHeading">
                                                        <p className="pageContentListSingleDetailsHeadingTxt">{subcategory.name}</p>
                                                    </div>
                                                    <div className="pageContentListSingleDetailsDescription">
                                                        <p className="pageContentListSingleDetailsDescriptionTxt">{subcategory.description}</p>
                                                    </div>

                                                    <div className="pageContentListSingleDetailsAction">
                                                        <p className="pageContentListSingleDetailsActionTxt" onClick={(e) => {
                                                            setName(subcategory.name);
                                                            setDescription(subcategory.description);
                                                            setHideReadMorePopUp(false);
                                                        }}>read more</p>
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="our-vision">
                <div className="our-vision-inner">
                    <div className="our-vision-indicator">
                        <div className="our-vision-indicator-inner">
                            <p className="our-vision-indicator-text">Our Vision</p>
                        </div>
                        <div className="our-vision-indicator-quote">
                            <img src="../images/quote.png" className="our-vision-indicator-quote-ico" />
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
                        <img src="../images/shop-1.jpg" className="store-gallery-single-img" />
                    </div>
                </div>
                <div className="store-gallery-single">
                    <div className="store-gallery-single-image">
                        <img src="../images/shop-2.jpg" className="store-gallery-single-img" />
                    </div>
                </div>
                <div className="store-gallery-single">
                    <div className="store-gallery-single-image">
                        <img src="../images/shop-3.jpg" className="store-gallery-single-img" />
                    </div>
                </div>
                <div className="store-gallery-single">
                    <div className="store-gallery-single-image">
                        <img src="../images/shop-4.jpg" className="store-gallery-single-img" />
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
                                    <img src="../../images/logo.png" className="contact-us-logo-img" />
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
        </>
    )
}

export default Subcategories;