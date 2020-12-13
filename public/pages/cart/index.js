import Head from 'next/head'
import { useState, useEffect } from 'react'
import axios from "axios";
import Link from 'next/link';
import { API_BASE_URL } from '../../config';
import Router from "next/router";
import $ from "jquery";
import Geocode from "react-geocode";

const Cart = () => {
    const [categories, setCategories] = useState([]);
    const [cartProducts, setCartProducts] = useState([]);

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

    const [isHasProducts, setIsHasProducts] = useState(false);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [isUserHasLocations, setIsUserHasLocations] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [showDeliveryLocations, setShowDeliveryLocations] = useState(false);
    const [showAddLocationForm, setShowAddLocationForm] = useState(false);
    const [showLocationsList, setShowLocationsList] = useState(false);

    const [products, setProducts] = useState([]);
    const [user, setUser] = useState([]);
    const [userLocation, setUserLocation] = useState([]);
    const [deliveryCost, setDeliveryCost] = useState('0');
    const [deliverDistance, setDeliveryDistance] = useState('0');
    const [userLat, setUserLat] = useState('');
    const [userLng, setUserLng] = useState('');

    useEffect(() => {
        const cartProducts = JSON.parse(localStorage.getItem('cart') || "[]");
        setCartProducts(cartProducts);
        if (cartProducts.length === 0) {
            setIsHasProducts(false);
        }
        else {
            setIsHasProducts(true);
            console.log(cartProducts);

        }
    }, []);

    useEffect(() => {
        console.log(isHasProducts);
    }, [isHasProducts]);

    useEffect(() => {
        if (cartProducts.length != 0) {
            getProducts(cartProducts);
        }
    }, [cartProducts]);

    useEffect(() => {
        console.log(isHasProducts);
        if (isHasProducts === true) {
            getUserDetails();
        }
    }, [isHasProducts]);

    const getUserDetails = () => {
        if (isHasProducts === true) {
            const user_id = localStorage.getItem('user_id');
            const user_token = localStorage.getItem('token');

            if (user_id === null) {
                setIsUserLoggedIn(false);
                setShowLoginForm(true);
                return;
            }
            if (user_id === '') {
                setIsUserLoggedIn(false);
                setShowLoginForm(true);
                return;
            }
            if (user_token === null) {
                setIsUserLoggedIn(false);
                setShowLoginForm(true);
                return;
            }
            if (user_token === '') {
                setIsUserLoggedIn(false);
                setShowLoginForm(true);
                return;
            }
            axios.get(`${API_BASE_URL}user/me/${user_id}`).then(result => {
                if (result.status === 200) {
                    const userGot = result.data.user;
                    setUser(userGot);
                    const delivery_locations = userGot.delivery_locations;
                    if (delivery_locations.length != 0) {
                        setUserLocation(delivery_locations[0]);
                        setShowLoginForm(false);
                        setShowDeliveryLocations(true);
                        setShowLocationsList(true);
                        setShowAddLocationForm(false);
                    }
                    else {
                        setShowLoginForm(false);
                        setShowDeliveryLocations(true);
                        setShowLocationsList(false);
                        setShowAddLocationForm(true);
                    }
                }
                else {
                    alert('User Not Found');
                }
            });
        }
    }

    useEffect(() => {
        if (user.length != 0) {
            console.log(user);
        }
    }, [user]);

    useEffect(() => {
        if (userLocation.length != 0) {
            console.log(userLocation);
            getDeliveryCharges().then(result => {
                setDeliveryCost(Math.round(result.data.small.rush));
                setDeliveryDistance(Math.round(result.data.distance));

            }).catch(err => {
                console.log(err);
            });
        }
    }, [userLocation]);

    useEffect(() => {
        if (deliveryCost === '0') {
            console.log('delivery cost not got');
        }
        if (deliverDistance === '0') {
            console.log('delivery distance not got');
        }
        else {
            console.log(deliverDistance);
            console.log(deliveryCost);
            $("#deliveryPriceInput").val(deliveryCost);
            calculateCartPrice();
        }
    }, [deliverDistance, deliveryCost]);

    /*Validation functions*/
    const validatePhone = function (phone) {
        var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        if ((phone.match(phoneno))) {
            return true;
        }
        else {
            return false;
        }
    }

    const validatePassword = function (password) {
        var passwordStrength = password.length;
        if (passwordStrength < 6) {
            return false;
        }
        return true;
    }

    const validatePincode = function (pincode) {
        var reg = /^[1-9][0-9]{5}$/;
        if (reg.test(pincode) == false) {
            return false;
        }
        else {
            return true;
        }
    }
    /*Validations*/

    const registerClicked = function () {
        setShowLoginForm(false);
        setShowRegistrationForm(true);
    }

    const [loginPhoneNo, setLoginPhoneNo] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const login = async function () {
        const phoneNo = loginPhoneNo;
        const password = loginPassword;
        if (phoneNo === '') {
            alert('Phone Number Cannot Be Empty');
            return;
        }
        if (password === '') {
            alert('Password Cannot Be Empty');
            return;
        }
        const isPhoneValid = await validatePhone(phoneNo);
        if (isPhoneValid === false) {
            alert('Please Enter a Valid Phone Number');
            return;
        }
        const isPasswordValid = await validatePassword(password);
        if (isPasswordValid === false) {
            alert('Passord Should Have Minimum 6 Characters');
            return;
        }

        const data = {
            phone_number: phoneNo,
            password: password
        }

        let loginUser = await axios.post(`${API_BASE_URL}user/login`, data);
        if (loginUser.status === 200) {
            localStorage.setItem('user_id', loginUser.data.user_id);
            localStorage.setItem('token', loginUser.data.token);
            getUserDetails();
        }
        else {
            alert('Invalid User ID / Password');
        }
    }

    const [registerName, setRegisterName] = useState('');
    const [registerPhoneNo, setRegisterPhoneNo] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerRepeatPassword, setRegisterRepeatPassword] = useState('');

    const registerNow = async function () {
        const name = registerName;
        const phoneNo = registerPhoneNo;
        const password = registerPassword;
        const repeatPassword = registerRepeatPassword;

        if (name === '') {
            alert('Name Cannot Be Empty');
            return;
        }
        if (phoneNo === '') {
            alert('Phone Number Cannot Be Empty');
            return;
        }
        if (password === '') {
            alert('Password Cannot Be Empty');
            return;
        }
        if (repeatPassword === '') {
            alert('Repeat Password Cannot Be Empty');
            return;
        }
        if (password != repeatPassword) {
            alert('Password Is Not Matching');
            return;
        }
        const isPhoneValid = await validatePhone(phoneNo);
        if (isPhoneValid === false) {
            alert('Please Enter a Valid Phone Number');
            return;
        }
        const isPasswordValid = await validatePassword(password);
        if (isPasswordValid === false) {
            alert('Passord Should Have Minimum 6 Characters');
            return;
        }

        const data = {
            name: name,
            phone_number: phoneNo,
            password: password
        }

        let saveUser = await axios.post(`${API_BASE_URL}user/create`, data);
        if (saveUser.status === 201) {
            alert('Successfully Registered!');
            setShowRegistrationForm(false);
            setShowLoginForm(true);
        }
    }

    const getDeliveryCharges = async () => {
        if (userLocation.length != 0) {
            const houseNo = userLocation.house_number;
            const address = userLocation.address;
            const landmark = userLocation.landmark;
            const pincode = userLocation.pincode;

            const location = `${houseNo}, ${address}, ${landmark}, ${pincode}`;

            Geocode.setApiKey("AIzaSyDaZw3HaJABMfVwI45LsosIwR1AYYCYeF0");
            Geocode.setLanguage("en");
            Geocode.setRegion("IN");
            Geocode.enableDebug();

            var userLat;
            var userLong;

            await Geocode.fromAddress(location).then(
                response => {
                    const { lat, lng } = response.results[0].geometry.location;
                    userLat = lat;
                    userLong = lng;
                },
                error => {

                }
            );

            var price_location_data = {
                origin: "12.935665909161738, 77.6245228190938",
                destination: `${userLat}, ${userLong}`
            }

            setUserLat(userLat);
            setUserLng(userLong);

            var config = {
                headers: { 'Content-Type': 'application/json' }
            };

            const pricing = await axios.post(`https://telyport.com/api/v2/beta/pricing`, price_location_data, config);
            return pricing;
        }
    }

    const [locationName, setLocationName] = useState('');
    const [locationHouseNo, setLocationHouseNo] = useState('');
    const [locationAddress, setLocationAddress] = useState('');
    const [locationPincode, setLocationPincode] = useState('');
    const [locationLandmark, setLocationLandmark] = useState('');

    const saveDeliveryLocations = async function () {
        const name = locationName;
        const house_no = locationHouseNo;
        const address = locationAddress;
        const landmark = locationLandmark
        const pincode = locationPincode;

        if (name === '') {
            alert('Location Name Cannot Be Empty');
            return;
        }

        if (house_no === '') {
            alert('House Number Cannot Be Empty');
            return;
        }

        if (address === '') {
            alert('Address Cannot Be Empty');
            return;
        }

        if (landmark === '') {
            alert('Landmark Cannot Be Empty');
            return;
        }

        if (pincode === '') {
            alert('Pincode Cannot Be Empty');
            return;
        }

        const isPincodeValid = await validatePincode(pincode);

        if (isPincodeValid === false) {
            alert('Please Enter a Valid Pincode');
            return;
        }
        else {
            var shortPin = pincode.substring(0, 3);

            if (shortPin === '560') {
                const data = {
                    _id: localStorage.getItem('user_id'),
                    name: name,
                    house_number: house_no,
                    address: address,
                    landmark: landmark,
                    pincode: pincode
                }

                let saveLocation = await axios.post(`${API_BASE_URL}user/locations/create`, data);
                if (saveLocation.status === 201) {
                    setShowAddLocationForm(false);
                    setShowLocationsList(true);

                    getUserDetails();
                }
            }
            else {
                alert('Sorry, Delivery Not Available At This Location');
            }
        }
    }

    const addQty = function (id) {
        const productId = id;

        const productPrice = $('#productQtyPrice' + id).val();
        let productQty = $('#productQty' + id).val();

        if (productQty === '') {
            productQty = 1;
        }

        const updatedProdQty = parseInt(productQty) + 1;

        const updatedProdPrice = parseInt(productPrice) * updatedProdQty;

        $("#productQtyLable" + id).html(updatedProdQty);
        $("#productQtyFinalPrice" + id).html(updatedProdPrice);
        $("#productQtyPriceUpdated" + id).val(updatedProdPrice);
        $('#productQty' + id).val(updatedProdQty);

        calculateCartPrice();
    }

    const reduceQty = function (id) {
        const productId = id;
        const productPrice = $('#productQtyPrice' + id).val();
        let productQty = $('#productQty' + id).val();

        if (productQty === '') {
            productQty = 1;
        }

        console.log(productQty);

        if (productQty != 1) {
            const updatedProdQty = parseInt(productQty) - 1;

            const updatedProdPrice = parseInt(productPrice) * updatedProdQty;

            $("#productQtyLable" + id).html(updatedProdQty);
            $("#productQtyFinalPrice" + id).html(updatedProdPrice);
            $("#productQtyPriceUpdated" + id).val(updatedProdPrice);
            $('#productQty' + id).val(updatedProdQty);

            calculateCartPrice();
        }
    }

    const getProducts = async (products) => {
        var prodIds = [];

        var i;
        for (i = 0; i < products.length; i++) {
            var tempCatrtProdId = products[i]._id;
            prodIds.push(tempCatrtProdId);
        }

        const data = {
            ids: prodIds
        }
        console.log(data)

        let getProducts = await axios.post(`${API_BASE_URL}product/cart`, data);
        if (getProducts.status === 200) {
            const products = getProducts.data.products;
            var i;
            for (i = 0; i < products.length; i++) {
                const productId = products[i]._id;

                var productCart;
                var ic;
                for (ic = 0; ic < cartProducts.length; ic++) {
                    var catrtProdId = cartProducts[ic]._id;
                    prodIds.push(catrtProdId);
                    if (catrtProdId === productId) {
                        productCart = cartProducts[ic];
                    }
                }
                products[i]['selectedCartPriceSlab'] = productCart.priceslab_id;

            }
            setProducts(products);
        }
    }

    useEffect(() => {
        if (products.length != 0) {
            calculateCartPrice();
        }
    }, [products]);

    const [netPrice, setNetPrice] = useState(0);
    const [tax, setTax] = useState(0);
    const [deliveryDiscountPrice, setDeliveryDiscountPrice] = useState(0);
    const [cashbackDiscountPrice, setCashbackDiscountPrice] = useState(0);
    const [grossPrice, setGrossPrice] = useState(0);

    const calculateCartPrice = function () {

        console.log('calculate price')

        var netPrice = 0;
        var i;
        for (i = 0; i < cartProducts.length; i++) {
            var currentProductId = cartProducts[i]._id;
            var currentUpdatedPrice = $('#productQtyPriceUpdated' + currentProductId).val();
            if (currentUpdatedPrice === '') {
                $("#productQty" + currentProductId).val('1');
                currentUpdatedPrice = $('#productQtyPrice' + currentProductId).val();
                $("#productQtyPriceUpdated" + currentProductId).val(currentUpdatedPrice);
            }
            console.log(currentUpdatedPrice);
            netPrice = parseInt(currentUpdatedPrice) + parseInt(netPrice);
        }

        console.log(netPrice);

        let deliDiscountPrice = 0;

        if (netPrice >= 650) {
            console.log('here');
            const finalDeliveryCost = (deliveryCost / 100) * 50;
            console.log(finalDeliveryCost);
            if (finalDeliveryCost >= 100) {
                deliDiscountPrice = 100;
                console.log(deliDiscountPrice);
            }
            else {
                deliDiscountPrice = Math.round(finalDeliveryCost);
                console.log(deliDiscountPrice);
            }
        }
        else {
            console.log('less');
        }
        console.log(netPrice)
        console.log(deliveryCost)
        console.log(deliDiscountPrice)

        var grossPrice = parseInt(netPrice) + parseInt(deliveryCost) - parseInt(deliDiscountPrice);

        console.log(grossPrice)

        $("#netPrice").html(netPrice);
        $("#netPriceInput").val(netPrice);

        $("#deliveryDiscountPrice").html(deliDiscountPrice);
        $("#deliveryDiscountPriceInput").val(deliDiscountPrice);

        $("#grossPrice").html(grossPrice);
        $("#grossPriceInput").val(grossPrice);

        var now = new Date();
        var currentHour = now.getHours();

        if (currentHour >= 21) {
            setIsButtonDisabled(true);
        }

        if (currentHour <= 6) {
            setIsButtonDisabled(true);
        }
    }

    useEffect(() => {
    }, [isButtonDisabled]);

    const placeOrder = async function () {

        var orderId = '';

        const items = [];

        var i;
        for (i = 0; i < products.length; i++) {
            const product = products[i];
            const price_slab_id = product.selectedCartPriceSlab;
            var price_slab_name;

            var ip;
            for (ip = 0; ip < product.priceslabs.length; ip++) {
                const current_price_slab_id = product.priceslabs[ip]._id;
                if (current_price_slab_id === price_slab_id) {
                    price_slab_name = product.priceslabs[ip].name
                }
            }

            var productQty = $("#productQty" + product._id).val();
            console.log(productQty);

            const productData = {
                _id: product._id,
                name: product.name,
                quantity: productQty,
                total_price: $("#productQtyPriceUpdated" + product._id).val(),
                price_per_unit: $("#productQtyPrice" + product._id).val(),
                priceslab: price_slab_name,
            }
            items.push(productData);
        }

        const date_time = await getReadableTime();

        const saveOrderData = {
            net_price: $("#netPriceInput").val(),
            delivery_price: $("#deliveryPriceInput").val(),
            delivery_discount_price: $("#deliveryDiscountPriceInput").val(),
            gross_price: $("#grossPriceInput").val(),
            address: `${userLocation.house_number}, ${userLocation.address}, ${userLocation.landmark}, ${userLocation.pincode}`,
            user_name: user.name,
            phone_number: `+91${user.phone_number}`,
            items: items,
            no_of_items: products.length,
            date_time: date_time
        }

        console.log(saveOrderData);

        const createOrder = await axios.post(`${API_BASE_URL}order/saveOrder`, saveOrderData);

        orderId = createOrder.data.order;

        const createTeleportOrder = async function () {
            const orderData = {
                data: [
                    {
                        fromAddress: {
                            address: '100 Feet Road, 17th Main, 6th Main Block, Koramangala',
                            lat: 12.935665909161738,
                            lng: 77.6245228190938,
                            house_no: 'No 40, Ground Floor',
                            landmark: 'Panasonic Signal, Near Ooty Chocolate',
                        },
                        toAddress: {
                            address: userLocation.address,
                            lat: userLat,
                            lng: userLng,
                            house_no: userLocation.house_number,
                            landmark: userLocation.landmark
                        },
                        shipType: "rush",
                        pack: {
                            type: 'medium',
                            isFragile: false,
                            isSecure: false,
                            itemTypes: [
                                "Raw Meat"
                            ],
                            no_of_items: 1,
                            weight: '3'
                        },
                        sender: {
                            name: "Country & Khadak",
                            mobileNumber: "+919108342799"
                        },
                        receiver: {
                            name: user.name,
                            mobileNumber: `+91${user.phone_number}`
                        },
                        scheduledTimestamp: 0,
                        deliveryChargesPayableAt: "Sender",
                        collectionsAmount: 0,
                        collectionsAmountPayableAt: "Sender",
                        tpCommissionsAmountPayableAt: "Sender",
                        paymentMode: "BusinessWallet",
                        orderType: "SEND",
                        instructions: ""
                    }
                ]
            }

            var config = {
                headers: {
                    'Content-Type': 'application/json',
                    'ApiKey': 'H07ZM3RV6USFKCZURI2ES7P75Q9P9I'

                }
            };

            const createOrder = await axios.post('https://telyport.com/api/create_bulk_order', orderData, config);
            if (createOrder.status === 200) {
                console.log(createOrder);
                alert('Order Placed Successfully');

                var data = {
                    id: orderId
                }

                const updateOrder = await axios.post(`${API_BASE_URL}order/updateorder`, data);

                if (updateOrder.status === 201) {
                    localStorage.removeItem('cart');
                    Router.push('/');
                }
                else {
                    alert('Something Went Wrong');
                }


            }
        }

        const collectPayment = async function () {
            var datas = {
                price: $("#grossPriceInput").val(),
            }
            const orderUrl = `${API_BASE_URL}order/create`;
            const response = await axios.post(orderUrl, datas);
            const { data } = response;
            const options = {
                key: 'rzp_live_tg2TBQIczjwPbS',
                name: "Country & Khadak",
                description: "Sample Description",
                order_id: data.id,
                handler: async (response) => {
                    try {
                        const paymentId = response.razorpay_payment_id;
                        const url = `${API_BASE_URL}order/capture/${paymentId}`;
                        const captureResponse = await axios.post(url, datas, {});
                    } catch (err) {
                    }
                    createTeleportOrder();
                },
                theme: {
                    color: "#686CFD",
                },
            }
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        }

        if (createOrder.status === 201) {
            var createdOrderData = createOrder.data;
            collectPayment();
        }
    }

    const getReadableTime = () => {
        var myDate = new Date();

        let daysList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Aug', 'Oct', 'Nov', 'Dec'];

        let date = myDate.getDate();
        let month = monthsList[myDate.getMonth()];
        let year = myDate.getFullYear();
        let day = daysList[myDate.getDay()];

        let today = `${date} ${month} ${year},`;

        let amOrPm;
        let twelveHours = function () {
            if (myDate.getHours() > 12) {
                amOrPm = 'PM';
                let twentyFourHourTime = myDate.getHours();
                let conversion = twentyFourHourTime - 12;
                return `${conversion}`

            } else {
                amOrPm = 'AM';
                return `${myDate.getHours()}`
            }
        };
        let hours = twelveHours();
        let minutes = myDate.getMinutes();

        let currentTime = `${hours}:${minutes} ${amOrPm}`;

        console.log(today + ' ' + currentTime);
        var readableTime = today + ' ' + currentTime;

        return readableTime
    }

    return (
        <>
            <Head>
                <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
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

            <div className="cartPage">
                <div className="cartPageInner">
                    <div className="pageContentHeading">
                        <p className="pageContentHeadingTxt">My Cart</p>

                        <div className="pageContentMain">

                            {
                                isHasProducts === true
                                    ?
                                    <>
                                        <div className="pageCartDetails">
                                            <div className="pageCartList">
                                                {
                                                    products.map(function (product, i) {
                                                        return (
                                                            <div className="pageCartListItem">
                                                                <div className="pageCartListItemImage">
                                                                    <img src={`${API_BASE_URL}${product.image_url}`} className="pageCartListItemImg" />
                                                                </div>
                                                                <div className="pageCartListItemDetails">
                                                                    <div className="pageCartListItemDetailsHeading">
                                                                        <p className="pageCartListItemDetailsHeadingTxt">{product.name}</p>
                                                                    </div>
                                                                    <div className="pageCartListItemDetailsSubHeading">
                                                                        {
                                                                            product.priceslabs.map(function (price, i) {
                                                                                return price._id === product.selectedCartPriceSlab
                                                                                    ? <p className="pageCartListItemDetailsSubHeadingTxt">{price.name} - Rs &nbsp; {price.price}</p>
                                                                                    : <></>
                                                                            })
                                                                        }
                                                                    </div>
                                                                    <div className="pageCartListItemQuantity">
                                                                        <div className="pageCartListItemQuantityInner">
                                                                            <div className="pageCartListItemQuantityLable">
                                                                                <p className="pageCartListItemQuantityLableTxt">Quantity:</p>
                                                                            </div>
                                                                            <div className="pageCartListItemQuantityInputs">
                                                                                <div className="pageCartListItemQuantityInputButton" onClick={(e) => reduceQty(product._id)}>
                                                                                    <p className="pageCartListItemQuantityInputButtonTxt">-</p>
                                                                                </div>
                                                                                <div className="pageCartListItemQuantityInputQuantity">
                                                                                    <p className="pageCartListItemQuantityInputQuantityTxt" id={`productQtyLable${product._id}`}>1</p>
                                                                                    <input type="hidden" id={`productQty${product._id}`} />
                                                                                </div>
                                                                                <div className="pageCartListItemQuantityInputButton" onClick={(e) => addQty(product._id)}>
                                                                                    <p className="pageCartListItemQuantityInputButtonTxt">+</p>
                                                                                </div>
                                                                            </div>

                                                                            {
                                                                                product.priceslabs.map(function (price, i) {
                                                                                    return price._id === product.selectedCartPriceSlab
                                                                                        ?
                                                                                        <div className="pageCartListItemQuantityPrice">
                                                                                            <p className="pageCartListItemQuantityPriceTxt">
                                                                                                <input type="hidden" id={`productQtyPrice${product._id}`} value={price.price} />
                                                                                                <input type="hidden" id={`productQtyPriceUpdated${product._id}`} />
                                                                                            Rs &nbsp;
                                                                                            <span id={`productQtyFinalPrice${product._id}`}>{price.price}</span>
                                                                                            </p>
                                                                                        </div>
                                                                                        : <></>
                                                                                })
                                                                            }

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>

                                            <div className="pricing">
                                                <div className="normalPricing">
                                                    <div className="normalPricingLable">
                                                        <p className="normalPricingLableTxt">Net Price:</p>
                                                    </div>
                                                    <div className="normalPricingDesc">
                                                        <p className="normalPricingDescTxt">
                                                            <span>Rs&nbsp;</span>
                                                            <span id="netPrice">{netPrice}</span>
                                                            <input type="hidden" id="netPriceInput" />
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="normalPricing">
                                                    <div className="normalPricingLable">
                                                        <p className="normalPricingLableTxt">Delivery Charges</p>
                                                    </div>
                                                    <div className="normalPricingDesc">
                                                        <p className="normalPricingDescTxt">
                                                            <span>Rs&nbsp;</span>
                                                            <span id="deliveryPrice">{deliveryCost} (Distance: {deliverDistance}&nbsp;Kms)</span>
                                                            <input type="hidden" id="deliveryPriceInput" />
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="normalPricing">
                                                    <div className="normalPricingLable">
                                                        <p className="normalPricingLableTxt">Delivery Discount</p>
                                                    </div>
                                                    <div className="normalPricingDesc">
                                                        <p className="normalPricingDescTxt">
                                                            <span>Rs&nbsp;</span>
                                                            <span id="deliveryDiscountPrice">{deliveryDiscountPrice}</span>
                                                            <input type="hidden" id="deliveryDiscountPriceInput" />
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="normalPricing">
                                                    <div className="normalPricingLable">
                                                        <p className="normalPricingLableTxt">Tax</p>
                                                    </div>
                                                    <div className="normalPricingDesc">
                                                        <p className="normalPricingDescTxt">
                                                            <span>Rs&nbsp;</span>
                                                            <span id="tax">{tax}</span>
                                                            <input type="hidden" id="taxInput" />
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="normalPricing">
                                                    <div className="normalPricingLable">
                                                        <p className="normalPricingLableTxt">Discount</p>
                                                    </div>
                                                    <div className="normalPricingDesc">
                                                        <p className="normalPricingDescTxt">
                                                            <span>Rs&nbsp;</span>
                                                            <span id="tax">{tax}</span>
                                                            <input type="hidden" id="taxInput" />
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="totalPrice">
                                                <div className="totalPriceLable">
                                                    <p className="totalPriceLableTxt">Total Price</p>
                                                </div>
                                                <div className="totalPriceValue">
                                                    <p className="totalPriceValueTxt">
                                                        <span className="totalPriceRsSpanTxt">Rs</span>
                                                        <span className="totalPriceValueSpanTxt" id="grossPrice">{grossPrice}</span>
                                                        <input type="hidden" id="grossPriceInput" />
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pageUserDetails">
                                            <div className="pageUserDetailsInner">

                                                {
                                                    showLoginForm === true
                                                        ?
                                                        <div className="loginToContinue">
                                                            <div className="loginToContinueHeading">
                                                                <p className="loginToContinueHeadingTxt">Login To Continue</p>
                                                                <div className="loginToContinueBorder">
                                                                    <div className="loginToContinueBorderInner">&nbsp;</div>
                                                                </div>
                                                            </div>

                                                            <div className="loginToContinueForm">
                                                                <div className="loginToContinueFormStep">
                                                                    <div className="loginToContinueFormStepLable">
                                                                        <p className="loginToContinueFormStepLableTxt">Phone Number</p>
                                                                    </div>
                                                                    <div className="loginToContinueFormStepInput">
                                                                        <input className="loginToContinueFormStepInputTxt" type="tel" placeholder="Please Enter Your Phone Number" value={loginPhoneNo} onChange={(e) => setLoginPhoneNo(e.target.value)} />
                                                                    </div>
                                                                </div>
                                                                <div className="loginToContinueFormStep">
                                                                    <div className="loginToContinueFormStepLable">
                                                                        <p className="loginToContinueFormStepLableTxt">Password</p>
                                                                    </div>
                                                                    <div className="loginToContinueFormStepInput">
                                                                        <input className="loginToContinueFormStepInputTxt" type="password" placeholder="Please Enter Your Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                                                                    </div>
                                                                </div>
                                                                <div className="loginToContinueFormStep">
                                                                    <div className="loginToContinueFormStepButton">
                                                                        <button className="loginToContinueFormStepInputButton" onClick={login}>Submit</button>
                                                                    </div>
                                                                </div>
                                                                <div className="loginToContinueFormStep">
                                                                    <p className="loginToContinueFormStepRegisterTxt">Don't have an account yet? <b className="loginToContinueFormStepRegisterLink" onClick={registerClicked}>Register Now</b></p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        :
                                                        <></>
                                                }

                                                {
                                                    showRegistrationForm === true
                                                        ?
                                                        <div className="loginToContinue">
                                                            <div className="loginToContinueHeading">
                                                                <p className="loginToContinueHeadingTxt">Register Now</p>
                                                                <div className="loginToContinueBorder">
                                                                    <div className="loginToContinueBorderInner">&nbsp;</div>
                                                                </div>
                                                            </div>

                                                            <div className="loginToContinueForm">

                                                                <div className="loginToContinueFormStep">
                                                                    <div className="loginToContinueFormStepLable">
                                                                        <p className="loginToContinueFormStepLableTxt">Name</p>
                                                                    </div>
                                                                    <div className="loginToContinueFormStepInput">
                                                                        <input className="loginToContinueFormStepInputTxt" type="text" placeholder="Please Enter Your Name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} />
                                                                    </div>
                                                                </div>
                                                                <div className="loginToContinueFormStep">
                                                                    <div className="loginToContinueFormStepLable">
                                                                        <p className="loginToContinueFormStepLableTxt">Phone Number</p>
                                                                    </div>
                                                                    <div className="loginToContinueFormStepInput">
                                                                        <input className="loginToContinueFormStepInputTxt" type="tel" placeholder="Please Enter Your Phone Number" value={registerPhoneNo} onChange={(e) => setRegisterPhoneNo(e.target.value)} />
                                                                    </div>
                                                                </div>
                                                                <div className="loginToContinueFormStep">
                                                                    <div className="loginToContinueFormStepLable">
                                                                        <p className="loginToContinueFormStepLableTxt">Password</p>
                                                                    </div>
                                                                    <div className="loginToContinueFormStepInput">
                                                                        <input className="loginToContinueFormStepInputTxt" type="password" placeholder="Please Enter Your Password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />
                                                                    </div>
                                                                </div>
                                                                <div className="loginToContinueFormStep">
                                                                    <div className="loginToContinueFormStepLable">
                                                                        <p className="loginToContinueFormStepLableTxt">Repeat Password</p>
                                                                    </div>
                                                                    <div className="loginToContinueFormStepInput">
                                                                        <input className="loginToContinueFormStepInputTxt" type="password" placeholder="Please Repeat Your Password" value={registerRepeatPassword} onChange={(e) => setRegisterRepeatPassword(e.target.value)} />
                                                                    </div>
                                                                </div>

                                                                <div className="loginToContinueFormStep">
                                                                    <div className="loginToContinueFormStepButton">
                                                                        <button className="loginToContinueFormStepInputButton" onClick={registerNow}>Submit</button>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>
                                                        :
                                                        <></>
                                                }

                                                {
                                                    showDeliveryLocations === true
                                                        ?
                                                        <div className="loginToContinue">
                                                            <div className="loginToContinueHeading">
                                                                <p className="loginToContinueHeadingTxt">delivery locations</p>
                                                                <div className="loginToContinueBorder">
                                                                    <div className="loginToContinueBorderInner">&nbsp;</div>
                                                                </div>
                                                            </div>

                                                            {
                                                                showAddLocationForm === true
                                                                    ?
                                                                    <div className="loginToContinueForm">
                                                                        <div className="loginToContinueFormStep">
                                                                            <div className="loginToContinueFormStepLable">
                                                                                <p className="loginToContinueFormStepLableTxt">Name</p>
                                                                            </div>
                                                                            <div className="loginToContinueFormStepInput">
                                                                                <input className="loginToContinueFormStepInputTxt" type="text" placeholder="Please Enter Your Name" value={locationName} onChange={(e) => { setLocationName(e.target.value) }} />
                                                                            </div>
                                                                        </div>
                                                                        <div className="loginToContinueFormStep">
                                                                            <div className="loginToContinueFormStepLable">
                                                                                <p className="loginToContinueFormStepLableTxt">House Number</p>
                                                                            </div>
                                                                            <div className="loginToContinueFormStepInput">
                                                                                <input className="loginToContinueFormStepInputTxt" type="text" placeholder="Please Enter Your House Number" value={locationHouseNo} onChange={(e) => { setLocationHouseNo(e.target.value) }} />
                                                                            </div>
                                                                        </div>
                                                                        <div className="loginToContinueFormStep">
                                                                            <div className="loginToContinueFormStepLable">
                                                                                <p className="loginToContinueFormStepLableTxt">Address</p>
                                                                            </div>
                                                                            <div className="loginToContinueFormStepInput">
                                                                                <input className="loginToContinueFormStepInputTxt" type="text" placeholder="Please Enter Your Address" value={locationAddress} onChange={(e) => { setLocationAddress(e.target.value) }} />
                                                                            </div>
                                                                        </div>
                                                                        <div className="loginToContinueFormStep">
                                                                            <div className="loginToContinueFormStepLable">
                                                                                <p className="loginToContinueFormStepLableTxt">Landmark</p>
                                                                            </div>
                                                                            <div className="loginToContinueFormStepInput">
                                                                                <input className="loginToContinueFormStepInputTxt" type="text" placeholder="Please Enter Your Landmark" value={locationLandmark} onChange={(e) => { setLocationLandmark(e.target.value) }} />
                                                                            </div>
                                                                        </div>
                                                                        <div className="loginToContinueFormStep">
                                                                            <div className="loginToContinueFormStepLable">
                                                                                <p className="loginToContinueFormStepLableTxt">Pincode</p>
                                                                            </div>
                                                                            <div className="loginToContinueFormStepInput">
                                                                                <input className="loginToContinueFormStepInputTxt" type="tel" placeholder="Please Enter Your Pincode" value={locationPincode} onChange={(e) => { setLocationPincode(e.target.value) }} />
                                                                            </div>
                                                                        </div>
                                                                        <div className="loginToContinueFormStep">
                                                                            <div className="loginToContinueFormStepButton">
                                                                                <button className="loginToContinueFormStepInputButton" onClick={saveDeliveryLocations}>Submit</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    : <></>
                                                            }

                                                            {
                                                                showLocationsList === true
                                                                    ?
                                                                    <div className="deliveryLocationsList">

                                                                        <div className="deliveryLocationSingle">
                                                                            <div className="deliveryLocationSingleTxt">
                                                                                <p className="pageCartListItemDetailsSubHeadingTxt"><b>Name:</b>&nbsp;{userLocation.name}</p>
                                                                            </div>
                                                                            <div className="deliveryLocationSingleTxt">
                                                                                <p className="pageCartListItemDetailsSubHeadingTxt"><b>House No.:</b>&nbsp;{userLocation.house_number}</p>
                                                                            </div>
                                                                            <div className="deliveryLocationSingleTxt">
                                                                                <p className="pageCartListItemDetailsSubHeadingTxt"><b>Landmark:</b>&nbsp;{userLocation.landmark}</p>
                                                                            </div>
                                                                            <div className="deliveryLocationSingleTxt">
                                                                                <p className="pageCartListItemDetailsSubHeadingTxt"><b>Address:</b>&nbsp;{userLocation.address}</p>
                                                                            </div>
                                                                            <div className="deliveryLocationSingleTxt">
                                                                                <p className="pageCartListItemDetailsSubHeadingTxt"><b>Pincode:</b>&nbsp;{userLocation.pincode}</p>
                                                                            </div>
                                                                        </div>
                                                                        {
                                                                            isButtonDisabled === false
                                                                                ?
                                                                                <div className="placeOrderButton">
                                                                                    <p className="placeOrderTxt" onClick={placeOrder}>Place Order</p>
                                                                                </div>
                                                                                : <></>
                                                                        }
                                                                    </div>
                                                                    : <></>
                                                            }

                                                        </div>
                                                        :
                                                        <></>
                                                }

                                            </div>
                                        </div>
                                    </>
                                    :
                                    <>
                                        <div className="emptyCart">
                                            <div className="emptyCartHeading">
                                                <p className="emptyCartHeadingTxt">Your Cart is Empty!</p>
                                            </div>
                                            <div className="emptyCartSubHeading">
                                                <p className="emptyCartSubHeadingTxt">Please add your products to cart and continue!</p>
                                            </div>
                                            <div className="emptyCartButton">
                                                <Link href="/">
                                                    <p className="emptyCartButtonTxt">Go Home</p>
                                                </Link>
                                            </div>
                                        </div>
                                    </>
                            }
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

export default Cart;