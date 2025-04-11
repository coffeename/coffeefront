import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [openForm, setOpenForm] = useState(null); // 'order','add','update','delete','deleteOrder'
  const role = localStorage.getItem('role');

  // Початкові стани для кожної форми
  const initialOrderForm = { productName: '', productId: null, quantity: 1 };
  const initialAddForm = { name: '', description: '', price: '', quantity: '' };
  const initialUpdateForm = { id: '', name: '', description: '', price: '', quantity: '' };
  const initialDeleteForm = { id: '' };
  const initialDeleteOrderForm = { id: '', creator_username: '', order_date: '' };

  // Стан для кожної форми
  const [orderFormData, setOrderFormData] = useState(initialOrderForm);
  const [addFormData, setAddFormData] = useState(initialAddForm);
  const [updateFormData, setUpdateFormData] = useState(initialUpdateForm);
  const [deleteFormData, setDeleteFormData] = useState(initialDeleteForm);
  const [deleteOrderFormData, setDeleteOrderFormData] = useState(initialDeleteOrderForm);

  // Завантаження продуктів
  useEffect(() => {
    fetch('http://127.0.0.1:5000/products', { method: 'GET', credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(() => alert('Помилка завантаження продуктів.'));
  }, []);

  // Завантаження історії замовлень
  useEffect(() => {
    fetch('http://127.0.0.1:5000/orders/history', { method: 'GET', credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch order history');
        return res.json();
      })
      .then(data => setOrderHistory(data))
      .catch(() => {/* silent */});
  }, []);

  // Клік по рядку історії замовлень
  const handleDeleteOrderRowClick = order => {
    setDeleteOrderFormData({
      id: order.id,
      creator_username: order.creator_username,
      order_date: order.order_date
    });
  };

  // Клік по рядку продуктів
  const handleRowClick = (item, formType) => {
    if (formType === 'order') {
      setOrderFormData({
        productName: item.name,
        productId: item.id,
        quantity: 1
      });
    } else if (formType === 'update') {
      setUpdateFormData({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity
      });
    } else if (formType === 'delete') {
      setDeleteFormData({ id: item.id });
    }
  };

  // Показ/приховання форм + очищення стану при закритті
  const toggleForm = formType => {
    if (openForm === formType) {
      setOpenForm(null);
      // очищаємо відповідний стан
      switch (formType) {
        case 'order':
          setOrderFormData(initialOrderForm);
          break;
        case 'add':
          setAddFormData(initialAddForm);
          break;
        case 'update':
          setUpdateFormData(initialUpdateForm);
          break;
        case 'delete':
          setDeleteFormData(initialDeleteForm);
          break;
        case 'deleteOrder':
          setDeleteOrderFormData(initialDeleteOrderForm);
          break;
      }
    } else {
      // відкриваємо — очищаємо стан перед показом
      switch (formType) {
        case 'order':
          setOrderFormData(initialOrderForm);
          break;
        case 'add':
          setAddFormData(initialAddForm);
          break;
        case 'update':
          setUpdateFormData(initialUpdateForm);
          break;
        case 'delete':
          setDeleteFormData(initialDeleteForm);
          break;
        case 'deleteOrder':
          setDeleteOrderFormData(initialDeleteOrderForm);
          break;
      }
      setOpenForm(formType);
    }
  };

  // Submit: створення замовлення
  const handleSubmitOrder = async e => {
    e.preventDefault();
    try {
      const items = [{ product_id: orderFormData.productId, quantity: parseInt(orderFormData.quantity, 10) }];
      const res = await fetch('http://127.0.0.1:5000/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.push_message || 'Замовлення створено');
        toggleForm('order');
      } else {
        alert(data.push_message || `Помилка створення замовлення: ${data.error}`);
      }
    } catch {
      alert('Сталася помилка при створенні замовлення.');
    }
  };

  // Submit: додавання продукту
  const handleSubmitAddProduct = async e => {
    e.preventDefault();
    try {
      const payload = { ...addFormData, initial_stock: addFormData.quantity };
      const res = await fetch('http://127.0.0.1:5000/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Продукт додано');
        toggleForm('add');
      } else {
        alert(`Помилка: ${data.error}`);
      }
    } catch {
      alert('Сталася помилка при додаванні продукту.');
    }
  };

  // Submit: оновлення продукту
  const handleSubmitUpdateProduct = async e => {
    e.preventDefault();
    try {
      const payload = {
        name: updateFormData.name,
        description: updateFormData.description,
        price: updateFormData.price,
        quantity: updateFormData.quantity,
        initial_stock: updateFormData.quantity
      };
      const res = await fetch(`http://127.0.0.1:5000/products/${updateFormData.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Продукт оновлено');
        toggleForm('update');
      } else {
        alert(`Помилка оновлення: ${data.error}`);
      }
    } catch {
      alert('Сталася помилка при оновленні продукту.');
    }
  };

  // Submit: видалення продукту
  const handleSubmitDeleteProduct = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:5000/products/${deleteFormData.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        alert('Продукт видалено');
        toggleForm('delete');
      } else {
        alert(`Помилка видалення: ${data.error}`);
      }
    } catch {
      alert('Сталася помилка при видаленні продукту.');
    }
  };

  // Submit: видалення замовлення
  const handleSubmitDeleteOrder = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:5000/orders/${deleteOrderFormData.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        alert('Замовлення видалено');
        toggleForm('deleteOrder');
        // оновлюємо історію
        const fresh = await fetch('http://127.0.0.1:5000/orders/history', { method: 'GET', credentials: 'include' });
        if (fresh.ok) setOrderHistory(await fresh.json());
      } else {
        alert(`Помилка видалення: ${data.error}`);
      }
    } catch {
      alert('Сталася помилка при видаленні замовлення.');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Історія замовлень */}
      <div className="order-history-container">
        <h3>Історія замовлень</h3>

        <div className="order-history-table-container">
          {orderHistory.length > 0 ? (
            <table className="order-history-table">
              <thead>
                <tr>
                  <th>ID замовлення</th>
                  <th>Назва продукту</th>
                  <th>Кількість</th>
                  {role !== 'barista' && (
                    <>
                      <th>Змінщик</th>
                      <th>Дата/Час</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {orderHistory.map((order, idx) => (
                  <tr
                    key={idx}
                    onClick={() => openForm === 'deleteOrder' && handleDeleteOrderRowClick(order)}
                  >
                    <td>{order.id}</td>
                    <td>{order.product_name}</td>
                    <td>{order.quantity}</td>
                    {role !== 'barista' && (
                      <>
                        <td>{order.creator_username}</td>
                        <td>{order.order_date}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Немає замовлень</p>
          )}
        </div>

        {role !== 'barista' && (
          <div className="history-button-group">
            <button className="action-button" onClick={() => toggleForm('deleteOrder')}>
              Видалити замовлення
            </button>
          </div>
        )}

        {openForm === 'deleteOrder' && (
          <div className="dashboard-form-container">
            <h4>Видалити замовлення</h4>
            <form onSubmit={handleSubmitDeleteOrder}>
              <div className="form-group">
                <label>ID замовлення:</label>
                <input type="number" value={deleteOrderFormData.id} readOnly />
              </div>
              <div className="form-group">
                <label>Змінщик:</label>
                <input type="text" value={deleteOrderFormData.creator_username} readOnly />
              </div>
              <div className="form-group">
                <label>Дата/Час:</label>
                <input type="text" value={deleteOrderFormData.order_date} readOnly />
              </div>
              <button type="submit" className="submit-order-button">
                Підтвердити
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Список продуктів */}
      <div className="dashboard-content">
        <h2>Список продуктів</h2>
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                {role !== 'barista' && <th>ID</th>}
                <th>Назва</th>
                <th>Опис</th>
                <th>Ціна (грн.)</th>
                <th>Кількість</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr
                  key={prod.id}
                  onClick={() => ['order','add','update','delete'].includes(openForm) && handleRowClick(prod, openForm)}
                >
                  {role !== 'barista' && <td>{prod.id}</td>}
                  <td>{prod.name}</td>
                  <td>{prod.description}</td>
                  <td>{prod.price}</td>
                  <td>{prod.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="button-group">
          {role === 'barista' ? (
            <button className="action-button" onClick={() => toggleForm('order')}>
              Зробити замовлення
            </button>
          ) : (
            <>
              <button className="action-button" onClick={() => toggleForm('order')}>
                Зробити замовлення
              </button>
              <button className="action-button" onClick={() => toggleForm('add')}>
                Додати продукт
              </button>
              <button className="action-button" onClick={() => toggleForm('update')}>
                Оновити продукт
              </button>
              <button className="action-button" onClick={() => toggleForm('delete')}>
                Видалити продукт
              </button>
            </>
          )}
        </div>

        {openForm === 'order' && (
          <div className="dashboard-form-container">
            <h4>Створити замовлення</h4>
            <form onSubmit={handleSubmitOrder}>
              <div className="form-group">
                <label>Назва товару:</label>
                <input
                  type="text"
                  value={orderFormData.productName}
                  readOnly
                  required
                />
              </div>
              <div className="form-group">
                <label>Кількість:</label>
                <input
                  type="number"
                  min="1"
                  value={orderFormData.quantity}
                  onChange={e => setOrderFormData({ ...orderFormData, quantity: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="submit-order-button">
                Підтвердити
              </button>
            </form>
          </div>
        )}

        {openForm === 'add' && (
          <div className="dashboard-form-container">
            <h4>Додати продукт</h4>
            <form onSubmit={handleSubmitAddProduct}>
              <div className="form-row">
                <div className="form-group half">
                  <label>Назва:</label>
                  <input
                    type="text"
                    value={addFormData.name}
                    onChange={e => setAddFormData({ ...addFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Ціна:</label>
                  <input
                    type="number"
                    value={addFormData.price}
                    onChange={e => setAddFormData({ ...addFormData, price: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Опис:</label>
                  <input
                    type="text"
                    value={addFormData.description}
                    onChange={e => setAddFormData({ ...addFormData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Кількість:</label>
                  <input
                    type="number"
                    value={addFormData.quantity}
                    onChange={e => setAddFormData({ ...addFormData, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="submit-order-button">
                Підтвердити
              </button>
            </form>
          </div>
        )}

        {openForm === 'update' && (
          <div className="dashboard-form-container">
            <h4>Оновити продукт</h4>
            <form onSubmit={handleSubmitUpdateProduct}>
              <div className="form-row">
                <div className="form-group half">
                  <label>Назва:</label>
                  <input
                    type="text"
                    value={updateFormData.name}
                    onChange={e => setUpdateFormData({ ...updateFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Ціна:</label>
                  <input
                    type="number"
                    value={updateFormData.price}
                    onChange={e => setUpdateFormData({ ...updateFormData, price: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Опис:</label>
                  <input
                    type="text"
                    value={updateFormData.description}
                    onChange={e => setUpdateFormData({ ...updateFormData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Кількість:</label>
                  <input
                    type="number"
                    value={updateFormData.quantity}
                    onChange={e => setUpdateFormData({ ...updateFormData, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="submit-order-button">
                Підтвердити
              </button>
            </form>
          </div>
        )}

        {openForm === 'delete' && (
          <div className="dashboard-form-container">
            <h4>Видалити продукт</h4>
            <form onSubmit={handleSubmitDeleteProduct}>
              <div className="form-group">
                <label>ID продукту:</label>
                <input
                  type="number"
                  value={deleteFormData.id}
                  onChange={e => setDeleteFormData({ ...deleteFormData, id: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="submit-order-button">
                Підтвердити
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
