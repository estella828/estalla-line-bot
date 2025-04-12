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
    function submitOrder() {
        const form = document.getElementById('cartForm');
        const formData = new FormData(form);
        
        // 添加購物車內容到備註
        const cartItems = document.querySelectorAll('.cart-item');
        let orderDetails = '訂購內容：\n';
        cartItems.forEach(item => {
            const name = item.querySelector('.cart-item-info h4').textContent;
            const quantity = item.querySelector('.quantity').textContent;
            const price = item.querySelector('.item-price').textContent;
            orderDetails += `${name} x ${quantity} (${price})\n`;
        });
        
        // 添加訂購人資訊
        const customerInfo = {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value,
            address: document.getElementById('customerAddress').value,
            note: document.getElementById('customerNote').value
        };
        
        // 構建通知訊息
        const message = `新訂單！\n\n${orderDetails}\n\n訂購人資訊：\n姓名：${customerInfo.name}\n電話：${customerInfo.phone}\n地址：${customerInfo.address}\n備註：${customerInfo.note}`;
        
        // 發送通知到 LINE
        fetch('https://notify-api.line.me/api/notify', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer R/Xor2TVbRcUjh2boUOFwRtL5CAZ5Q8epBoyEmNjl3gLOcd7IrgUIaC6mOfNSA6M1G+uctCI6RS7bmaV2TG2At1c4B7K4lvcv72uAMxtsXiF+b7BdU2E+l1M8t7hVI9e4YuhamMh70HWsVYVeG7SIgdB04t89/1O/w1cDnyilFU='
            },
            body: new URLSearchParams({
                message: message
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 200) {
                alert('訂單已送出，我們會盡快與您聯繫！');
                cart = [];
                closeCart();
                updateCartDisplay();
            } else {
                alert('發送訂單時發生錯誤，請稍後再試。');
            }
        })
        .catch(error => {
            console.error('發送訂單時發生錯誤:', error);
            alert('發送訂單時發生錯誤，請稍後再試。');
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
});
