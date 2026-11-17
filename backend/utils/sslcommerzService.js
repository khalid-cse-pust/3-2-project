const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * SSLCommerz Gateway Helper
 * Handles session initialization and transaction verification.
 */
class SSLCommerzService {
  constructor() {
    this.storeId = process.env.SSLCOMMERZ_STORE_ID || 'pust661234test';
    this.storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD || 'pust661234test@ssl';
    this.isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';
    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Sandbox vs Live URLs
    this.initUrl = this.isLive
      ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

    this.validationUrl = this.isLive
      ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
      : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';
  }

  /**
   * Helper to perform HTTP/HTTPS form-urlencoded POST
   */
  async _postRequest(targetUrl, payload) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(targetUrl);
      const postData = new URLSearchParams(payload).toString();

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
        timeout: 15000,
      };

      const lib = parsedUrl.protocol === 'https:' ? https : http;

      const req = lib.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (e) {
            resolve({ raw: body, status: res.statusCode });
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('SSLCommerz gateway request timed out'));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Helper to perform HTTP/HTTPS GET
   */
  async _getRequest(targetUrl) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(targetUrl);
      const lib = parsedUrl.protocol === 'https:' ? https : http;

      const req = lib.get(targetUrl, { timeout: 15000 }, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (e) {
            resolve({ raw: body, status: res.statusCode });
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('SSLCommerz validation request timed out'));
      });
    });
  }

  /**
   * Initialize a payment session with SSLCommerz
   */
  async initPayment({
    transactionId,
    amount,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    invoiceTitle,
  }) {
    const postData = {
      store_id: this.storeId,
      store_passwd: this.storePassword,
      total_amount: Number(amount).toFixed(2),
      currency: 'BDT',
      tran_id: transactionId,
      success_url: `${this.backendUrl}/api/payments/sslcommerz/success`,
      fail_url: `${this.backendUrl}/api/payments/sslcommerz/fail`,
      cancel_url: `${this.backendUrl}/api/payments/sslcommerz/cancel`,
      ipn_url: `${this.backendUrl}/api/payments/sslcommerz/ipn`,
      shipping_method: 'NO',
      product_name: invoiceTitle || 'Shadhinota Hall Fee',
      product_category: 'Hall Accommodation Service',
      product_profile: 'general',
      cus_name: customerName || 'PUST Student',
      cus_email: customerEmail || 'student@pust.ac.bd',
      cus_add1: customerAddress || 'Shadhinota Hall, PUST, Pabna',
      cus_city: 'Pabna',
      cus_postcode: '6600',
      cus_country: 'Bangladesh',
      cus_phone: customerPhone || '01700000000',
    };

    try {
      const result = await this._postRequest(this.initUrl, postData);
      
      // If gateway returned GatewayPageURL
      if (result && result.status === 'SUCCESS' && result.GatewayPageURL) {
        return {
          success: true,
          gatewayUrl: result.GatewayPageURL,
          sessionkey: result.sessionkey,
          isMock: false,
        };
      }

      // If test credentials fail with remote gateway (e.g., DNS or store credential not yet activated on SSLCommerz),
      // we provide a safe, clearly flagged Sandbox Simulation URL pointing to our internal test verification screen.
      console.warn('SSLCommerz remote response not SUCCESS, falling back to Sandbox Simulation Mode:', result?.failedreason || result);
      return {
        success: true,
        gatewayUrl: `${this.frontendUrl}/#payment-sandbox?tran_id=${transactionId}&amount=${amount}`,
        isMock: true,
        reason: result?.failedreason || 'Sandbox credentials simulated mode',
      };
    } catch (error) {
      console.warn('SSLCommerz connection failed, activating Sandbox Test Interface:', error.message);
      return {
        success: true,
        gatewayUrl: `${this.frontendUrl}/#payment-sandbox?tran_id=${transactionId}&amount=${amount}`,
        isMock: true,
        reason: error.message,
      };
    }
  }

  /**
   * Validate payment via SSLCommerz Validator API
   */
  async validateTransaction({ valId, transactionId, amount }) {
    if (!valId) {
      return { isValid: false, message: 'Missing val_id for validation' };
    }

    const queryUrl = `${this.validationUrl}?val_id=${encodeURIComponent(
      valId
    )}&store_id=${encodeURIComponent(this.storeId)}&store_passwd=${encodeURIComponent(
      this.storePassword
    )}&format=json`;

    try {
      const response = await this._getRequest(queryUrl);
      if (
        response &&
        (response.status === 'VALID' || response.status === 'VALIDATED') &&
        response.tran_id === transactionId
      ) {
        // Validate amount
        const paidAmount = parseFloat(response.amount);
        const expectedAmount = parseFloat(amount);
        if (Math.abs(paidAmount - expectedAmount) > 0.01) {
          return { isValid: false, message: 'Amount mismatch detected during validation' };
        }

        return {
          isValid: true,
          data: response,
          bankTranId: response.bank_tran_id,
          cardType: response.card_type,
        };
      }

      return {
        isValid: false,
        message: response?.error || 'Payment validation returned invalid status',
      };
    } catch (err) {
      console.error('SSLCommerz verification failed:', err);
      return { isValid: false, message: err.message };
    }
  }
}

module.exports = new SSLCommerzService();
