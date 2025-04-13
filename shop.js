document.addEventListener('DOMContentLoaded', function() {
    // 初始化購物車狀態
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartBtn = document.querySelector('.cart-btn');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartItems = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const totalAmount = document.querySelector('.total-amount');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const closeCartBtn = document.querySelector('.close-cart');

    // 打開購物車
    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // 關閉購物車
    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // 購物車按鈕點擊
    cartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openCart();
    });

    // 關閉按鈕點擊
    closeCartBtn.addEventListener('click', closeCart);

    // 點擊遮罩關閉
    cartOverlay.addEventListener('click', closeCart);

    // 初始更新購物車顯示
    updateCartDisplay();

    // 分類切換功能
    const categoryTabs = document.querySelectorAll('.category-tab');
    const productGrids = document.querySelectorAll('.products-grid');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            productGrids.forEach(grid => grid.classList.add('hidden'));
            const targetGrid = document.getElementById(tab.dataset.category);
            targetGrid.classList.remove('hidden');
        });
    });

    // 購物車側邊欄控制
    cartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cartSidebar.classList.add('active');
    });

    // 關閉購物車側邊欄
    document.addEventListener('click', (e) => {
        if (!cartSidebar.contains(e.target) && !cartBtn.contains(e.target)) {
            cartSidebar.classList.remove('active');
        }
    });

    cartSidebar.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 關閉購物車的點擊事件
    document.addEventListener('click', (e) => {
        if (!cartSidebar.contains(e.target) && !cartBtn.contains(e.target)) {
            cartSidebar.classList.remove('active');
        }
    });

    // 防止購物車側邊欄內部的點擊事件冒泡
    cartSidebar.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 加入購物車
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const product = {
                id: button.dataset.id,
                name: button.dataset.name,
                price: parseInt(button.dataset.price),
                quantity: 1
            };

            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push(product);
            }

            // 儲存到 localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            // 更新顯示
            updateCartDisplay();
            cartSidebar.classList.add('active');
            
            // 顯示加入購物車的提示
            button.innerHTML = '<i class="fas fa-check"></i> 已加入購物車';
            button.classList.add('added');
            setTimeout(() => {
                button.innerHTML = '加入購物車';
                button.classList.remove('added');
            }, 1000);
        });
    });

    // 更新購物車顯示
    function updateCartDisplay() {
        cartItems.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>購物車是空的</p>
                </div>
            `;
            checkoutBtn.disabled = true;
            cartCount.style.display = 'none';
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p class="item-price">NT$ ${item.price.toLocaleString()} × ${item.quantity}</p>
                        <p class="item-total">小計：NT$ ${itemTotal.toLocaleString()}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        <button class="remove-btn" data-id="${item.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                cartItems.appendChild(itemElement);
            });

            checkoutBtn.disabled = false;
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = 'flex';
        }

        totalAmount.textContent = `NT$ ${total.toLocaleString()}`;
        saveCart();
    }

    // 保存購物車
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // 更新商品數量
    function updateQuantity(productId, change) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex !== -1) {
            cart[itemIndex].quantity = Math.max(0, cart[itemIndex].quantity + change);
            if (cart[itemIndex].quantity === 0) {
                cart.splice(itemIndex, 1);
            }
            updateCartDisplay();
        }
    }

    // 移除商品
    function removeItem(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartDisplay();
    }

    // 綁定購物車項目事件
    cartItems.addEventListener('click', function(e) {
        const target = e.target;
        const cartItem = target.closest('.cart-item');
        if (!cartItem) return;

        const productId = target.closest('[data-id]')?.dataset.id;
        if (!productId) return;

        if (target.closest('.minus')) {
            updateQuantity(productId, -1);
        } else if (target.closest('.plus')) {
            updateQuantity(productId, 1);
        } else if (target.closest('.remove-btn')) {
            removeItem(productId);
        }
    });

    // 載入儲存的購物車狀態
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }

    // 結帳按鈕
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('購物車是空的！');
            return;
        }

        // 如果是第一步，顯示訂購人資訊表單
        if (!this.dataset.step || this.dataset.step === 'cart') {
            document.querySelector('.cart-items').classList.add('hidden');
            document.querySelector('.cart-form').classList.remove('hidden');
            this.textContent = '確認訂購';
            this.dataset.step = 'form';
            return;
        }

        // 如果是第二步，處理表單提交
        if (this.dataset.step === 'form') {
            submitOrder();
        }
    });

    // 提交表單
    async function submitOrder() {
        try {
            // 驗證表單
            const name = document.getElementById('customerName')?.value || '';
            const phone = document.getElementById('customerPhone')?.value || '';
            const email = document.getElementById('customerEmail')?.value || '';
            const address = document.getElementById('customerAddress')?.value || '';
            
            if (!name.trim() || !phone.trim() || !email.trim() || !address.trim()) {
                alert('請填寫完整的訂購人資訊！');
                return;
            }

            // 添加購物車內容到備註
            const cartItems = document.querySelectorAll('.cart-item');
            let orderDetails = '訂購內容：\n';
            cartItems.forEach(item => {
                const name = item.querySelector('.product-name')?.textContent || '未知商品';
                const quantity = item.querySelector('.quantity')?.value || '0';
                const price = item.querySelector('.product-price')?.textContent || '0';
                orderDetails += `${name} x ${quantity} (${price})\n`;
            });
            
            // 添加訂購人資訊
            const note = document.getElementById('customerNote')?.value || '';
            
            // 構建通知訊息
            const message = `新訂單！\n\n${orderDetails}\n\n訂購人資訊：\n姓名：${name}\n電話：${phone}\n地址：${address}\n備註：${note}`;
            
            // 發送通知到 Netlify
            const API_URL = 'https://taiwanagla-2025.netlify.app/.netlify/functions/submit-order';
            console.log('Sending order to API...');
            console.log('Order message:', message);
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify({ message: message })
            });

            console.log('API Response:', response);
            
            if (!response.ok) {
                throw new Error(`Netlify API returned status ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response Data:', data);

            if (data.message === 'Order submitted successfully') {
                alert('訂單已送出，我們會盡快與您聯繫！');
                cart = [];
                closeCart();
                updateCartDisplay();
            } else {
                throw new Error(data.error || 'API returned non-success status');
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            if (error.message.includes('403')) {
                alert('發送訂單時發生錯誤。請確認：\n1. LINE Notify Token 已正確設置\n2. Token 未過期\n3. Token 有足夠的權限');
            } else if (error.message.includes('405')) {
                alert('發送訂單時發生錯誤。請確認：\n1. Netlify 函數已正確部署\n2. API 端點正確\n3. 函數目錄正確設置');
            } else {
                alert('發送訂單時發生錯誤，請稍後再試。\n錯誤詳情：' + error.message);
            }
        }
    }

    // 初始化表單提交
    const form = document.getElementById('cartForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            submitOrder();
        });
    }

    // 綁定加入購物車按鈕
    document.querySelectorAll('.add-to-cart').forEach(button => {
        // 移除現有的事件監聽器
        button.replaceWith(button.cloneNode(true));
    });

    // 重新綁定事件監聽器
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const product = {
                id: this.dataset.id,
                name: this.dataset.name,
                price: parseInt(this.dataset.price),
                quantity: 1
            };

            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push(product);
            }

            updateCartDisplay();
            openCart();

            this.classList.add('added');
            setTimeout(() => this.classList.remove('added'), 1000);
        });
    });

    // 初始化顯示
    updateCartDisplay();

    // 測試 API 連接
    function testApi() {
        try {
            const testMessage = '測試訊息：網站正在運作正常';
            
            const API_URL = 'https://taiwanagla-2025.netlify.app/.netlify/functions/submit-order';
            fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify({ message: testMessage })
            })
            .then(response => {
                console.log('Netlify API response:', response);
                if (!response.ok) {
                    throw new Error('API 返回錯誤狀態');
                }
                return response.json();
            })
            .then(data => {
                alert('API 測試成功！');
            })
            .catch(error => {
                console.error('API 測試失敗:', error);
                alert('API 測試失敗。\n錯誤詳情：' + error.message);
            });
        } catch (error) {
            console.error('API 測試時發生錯誤:', error);
            alert('API 測試時發生錯誤。\n錯誤詳情：' + error.message);
        }
    }

    // 測試函數
    function testFunction() {
        try {
            console.log('Testing Netlify function...');
            
            fetch('/.netlify/functions/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify({ test: true })
            })
            .then(response => {
                console.log('Test API Response:', response);
                if (!response.ok) {
                    throw new Error(`Test API returned status ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Test API Response Data:', data);
                alert('測試成功！\n\n回應數據：\n' + JSON.stringify(data, null, 2));
            })
            .catch(error => {
                console.error('Error testing function:', error);
                alert('測試失敗。\n\n錯誤詳情：' + error.message);
            });
        } catch (error) {
            console.error('Error in testFunction:', error);
            alert('測試失敗。\n\n錯誤詳情：' + error.message);
        }
    }

    // 在 HTML 中添加測試按鈕
    // 在購物車按鈕附近添加：
    const testButton = document.createElement('button');
    testButton.textContent = '測試功能';
    testButton.onclick = testFunction;
    document.body.appendChild(testButton);

    // 在頁面加載時添加測試按鈕
    const testApiButton = document.createElement('button');
    testApiButton.textContent = '測試 API 連接';
    testApiButton.onclick = testApi;
    document.body.appendChild(testApiButton);
});
