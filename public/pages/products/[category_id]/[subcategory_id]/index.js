import Head from 'next/head'
import { useState, useEffect } from 'react'
import axios from "axios";
import Link from 'next/link';
import { API_BASE_URL } from '../../../../config';
import { useRouter } from 'next/router';
import $ from "jquery";

const Subcategoryproducts = () => {

    const router = useRouter()
    const { category_id, subcategory_id } = router.query;

    const [categories, setCategories] = useState([]);
    const [subcategory, setSubcategory] = useState([]);
    const [products, setProducts] = useState([]);

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
        const categoryId = category_id;
        const subCategoryId = subcategory_id;
        getActiveProducts(categoryId, subCategoryId)
    }, [category_id, subcategory_id]);

    useEffect(() => {
    }, [products]);

    useEffect(async () => {
        const subCategoryId = subcategory_id;
        if (subCategoryId != undefined) {
            let getSubCategory = await axios.get(`${API_BASE_URL}subcategory/${subCategoryId}`);
            if (getSubCategory.status === 200) {
                setSubcategory(getSubCategory.data.subcategory);
            }
        }
    }, [category_id, subcategory_id]);

    useEffect(() => {
    }, [subcategory]);

    const addThisToCart = async (id) => {
        const cartItems = JSON.parse(localStorage.getItem('cart') || "[]");

        const priceSlabId = $('#priceSlab' + id).val();

        const cartItemData = {
            _id: id,
            priceslab_id: priceSlabId
        }

        const updateCart = [];

        const categoryId = category_id;
        const subCategoryId = subcategory_id;

        if (cartItems.length === 0) {
            updateCart.push(cartItemData);
            localStorage.setItem('cart', JSON.stringify(updateCart));

            getActiveProducts(categoryId, subCategoryId);
            getCartCount();
        }
        else {
            const currentItems = cartItems;
            const checkIfItemExist = currentItems.findIndex(cartItem => cartItem._id === id);

            if (checkIfItemExist === -1) {
                currentItems.push(cartItemData);
                localStorage.setItem('cart', JSON.stringify(currentItems));
                getActiveProducts(categoryId, subCategoryId);
                getCartCount();
            }
            else {
            }
        }
    }

    const removeThisToCart = async (id) => {
        const categoryId = category_id;
        const subCategoryId = subcategory_id;

        const cartItems = JSON.parse(localStorage.getItem('cart') || "[]");
        if (cartItems.length != 0) {
            const currentItems = cartItems;
            const itemIndex = currentItems.findIndex(cartItem => cartItem._id === id);

            currentItems.splice(itemIndex, 1);
            localStorage.setItem('cart', JSON.stringify(currentItems));

            getActiveProducts(categoryId, subCategoryId);
            getCartCount();
        }
    }

    const setProductPackage = (priceslab_id, product_id) => {
        $('#priceSlab' + product_id).val(priceslab_id);

        const priceSlab = $('#priceSlab' + product_id).val();
    }

    const getActiveProducts = async function (categoryId, subCategoryId) {
        let getProducts = await axios.get(`${API_BASE_URL}product/active/${categoryId}/${subCategoryId}`);
        if (getProducts.status === 200) {
            const loopProducts = getProducts.data.products;

            var i;
            for (i = 0; i < loopProducts.length; i++) {
                var tempProductId = loopProducts[i]._id;
                const cartItems = JSON.parse(localStorage.getItem('cart') || "[]");
                if (cartItems.length != 0) {
                    const checkIfItemExist = cartItems.findIndex(cartItem => cartItem._id === tempProductId);

                    if (checkIfItemExist === -1) {
                        loopProducts[i]['isAddedToCart'] = false;
                    }
                    else {
                        loopProducts[i]['isAddedToCart'] = true;
                    }
                }
                else {
                    loopProducts[i]['isAddedToCart'] = false;
                }
            }
            setProducts(loopProducts);
        }
    }

    return (
        <>
            <Head>
                <title>Country &amp; Khadak</title>
            </Head>
            <div className="headerPages">
                <div className="headerMain">
                    <a href="/">
                        <div className="headerLogo">
                            <div className="headerLogoImage">
                                <img src="../../../images/logo.png" className="headerLogoImg" />
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
                        <p className="pageContentHeadingTxt">{subcategory.name}</p>

                        <div className="pageContentMain">
                            <ul className="pageContentList">
                                {
                                    products.map(function (product, i) {
                                        return (
                                            <li className="pageContentListSingle" key={product._id}>
                                                <div className="pageContentListSingleImage">
                                                    <img src={`${API_BASE_URL}${product.image_url}`} className="pageContentListSingleImg" />
                                                </div>
                                                <div className="pageContentListSingleDetails">
                                                    <div className="pageContentListSingleDetailsHeading">
                                                        <p className="pageContentListSingleDetailsHeadingTxt">{product.name}</p>
                                                    </div>

                                                    <div className="pageContentListSingleDetailsPriceslab">
                                                        <div className="pageContentListSingleDetailsPriceslabInner">
                                                            <select onChange={(e) => { setProductPackage(e.target.value, product._id) }} className="pageContentListSingleDetailsPriceslabSelect">
                                                                {
                                                                    product.priceslabs.map(function (prices, i) {
                                                                        return (
                                                                            <option key={prices._id} value={prices._id}>{prices.name} - Rs {prices.price}</option>
                                                                        )
                                                                    })
                                                                }
                                                            </select>
                                                            {
                                                                product.priceslabs.slice(0, 1).map(function (prices, i) {
                                                                    return (
                                                                        <input type="hidden" id={`priceSlab${product._id}`} value={prices._id} key={prices._id} />
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                    </div>

                                                    <div className="pageContentListSingleDetailsAddToCart">
                                                        {
                                                            product.isAddedToCart === false
                                                                ?
                                                                <div className="pageContentListSingleDetailsAddToCartButton" onClick={(e) => { addThisToCart(product._id) }}>
                                                                    <p className="pageContentListSingleDetailsAddToCartButtonTxt">Add To Cart</p>
                                                                </div>
                                                                :
                                                                <div className="pageContentListSingleDetailsAddToCartButton" onClick={(e) => { removeThisToCart(product._id) }}>
                                                                    <p className="pageContentListSingleDetailsAddToCartButtonTxt">Remove From Cart</p>
                                                                </div>
                                                        }

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
                            <img src="../../../images/quote.png" className="our-vision-indicator-quote-ico" />
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
                        <img src="../../../images/shop-1.jpg" className="store-gallery-single-img" />
                    </div>
                </div>
                <div className="store-gallery-single">
                    <div className="store-gallery-single-image">
                        <img src="../../../images/shop-2.jpg" className="store-gallery-single-img" />
                    </div>
                </div>
                <div className="store-gallery-single">
                    <div className="store-gallery-single-image">
                        <img src="../../../images/shop-3.jpg" className="store-gallery-single-img" />
                    </div>
                </div>
                <div className="store-gallery-single">
                    <div className="store-gallery-single-image">
                        <img src="../../../images/shop-4.jpg" className="store-gallery-single-img" />
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
                                    <img src="../../../images/logo.png" className="contact-us-logo-img" />
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
        </>
    )
}

export default Subcategoryproducts;