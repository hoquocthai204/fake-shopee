import { Button, InputNumber } from 'antd';
import orderApi from 'api/orderApi';
import productApi from 'api/productApi';
import walletApi from 'api/walletApi';
import Breadcrumb from 'components/Common/Breadcrumb';
import { ModalComponent } from 'components/Common/ModalComponent';
import { CoinIcon } from 'components/Icons/CoinIcon';
import { ProductInfo } from 'models/product/productInfo';
import { WalletInformation } from 'models/wallet/walletInformation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { useLocation } from 'react-router-dom';
import RateComponent from '../components/RateComponent';
import { AddCartIcon } from 'components/Icons';
import warrantyIcon from 'assets/images/warranty_icon.png';
import CustomInputNumber from '../components/CustomInputNumber';
import ProductDetailOption from '../components/ProductDetailOption';

interface ProductDetailPageProps {}

const ProductDetailPage: React.FunctionComponent<ProductDetailPageProps> = (props) => {
  const [productDetail, setProductDetail] = useState<ProductInfo>();
  const token = useRef(localStorage.getItem('token')).current || '';
  const [quantity, setQuantity] = useState<number>(1);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [walletInfo, setWalletInfo] = useState<WalletInformation>();
  const [isEnoughBalance, setIsEnoughBalance] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<number | boolean>(false);
  const locate = useLocation();

  useEffect(() => {
    const productId = Number(locate.pathname.split('/')[2]);
    getProductDetail(productId);
  }, []);

  const getProductDetail = useCallback(async (id: number) => {
    const res = await productApi.getProduct(id);
    if (res) {
      setProductDetail(res);
    }
  }, []);

  useEffect(() => {
    if (productDetail?.price && walletInfo?.balance) {
      if (quantity * productDetail.price <= walletInfo.balance) {
        setIsEnoughBalance(true);
      } else setIsEnoughBalance(false);
    }
  }, [productDetail, walletInfo]);

  useEffect(() => {
    if (productDetail?.price && walletInfo?.balance) {
      if (quantity * productDetail.price <= walletInfo.balance) {
        setIsEnoughBalance(true);
      } else setIsEnoughBalance(false);
    }
  }, [quantity]);

  const handleBuy = () => {
    setOpenModal(true);
  };

  useEffect(() => {
    getWalletInfo();
  }, []);

  const getWalletInfo = useCallback(async () => {
    const res = await walletApi.getWallet(token);
    if (res) {
      setWalletInfo(res);
    }
  }, []);

  const createOrder = useCallback(async () => {
    const res = await orderApi.createOrder(token, {
      merchantId: productDetail?.merchantId || -1,
      currency: 'usd',
      productInformation: {
        productId: productDetail?.id || -1,
        quantity: quantity,
      },
    });

    if (res) {
      setOrderId(Number(res.qrContent) || 0);
    }
  }, [productDetail, quantity]);

  const onChangeNumber = (value: number) => {
    value >= 1 && setQuantity(value);
  };

  return (
    <div className="container">
      <div className="product-detail">
        <Breadcrumb />
        {productDetail && (
          <div className="product-detail__container">
            <div className="product-detail__left-side">
              <div className="product-detail__img-container">
                <img src={productDetail.images.toString()} alt="product" />
              </div>
            </div>

            <div className="product-detail__right-side">
              <div className="product-detail__header-container">
                <div className="product-detail__header">{productDetail.name}</div>
                <RateComponent rateNumber={3.5} />
              </div>

              <div className="product-detail__price">
                <CoinIcon /> {productDetail.price * quantity}
              </div>

              <div className="product-detail__category-container">
                <div className="product-detail__quantity">
                  <span>Số Lượng</span>
                  <CustomInputNumber value={quantity} onChange={onChangeNumber} />
                  <span>12013 sản phẩm có sẵn</span>
                </div>
              </div>

              <ProductDetailOption handleBuy={handleBuy} />

              <div className="product-detail__warranty">
                <img src={warrantyIcon} alt="warranty icon" />
                <span>Shopee Đảm Bảo</span>
                <span>3 Ngày Trả Hàng / Hoàn Tiền</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <ModalComponent
        openModal={openModal}
        title={isEnoughBalance ? 'Buy Product' : 'Error'}
        onOk={isEnoughBalance ? () => createOrder() : () => {}}
        setOpenModal={setOpenModal}
        description={
          isEnoughBalance ? 'Confirm to buy this product?' : 'No enough balance to buy this product'
        }
      />

      <ModalComponent
        noFooter
        title="Scan QR code to continue"
        openModal={orderId ? true : false}
        onOk={isEnoughBalance ? () => createOrder() : () => {}}
        setOpenModal={setOrderId}
        description={
          <div style={{ height: 'auto', margin: '0 auto', maxWidth: 200, width: '100%' }}>
            <QRCode
              size={256}
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              value={orderId.toString()}
              viewBox={`0 0 256 256`}
            />
          </div>
        }
      />
    </div>
  );
};

export default ProductDetailPage;
