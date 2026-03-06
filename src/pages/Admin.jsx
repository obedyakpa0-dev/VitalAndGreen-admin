import { useState, useEffect } from "react"
import { motion } from "framer-motion" // eslint-disable-line no-unused-vars
import { productsAPI, ordersAPI } from "../services/api"

const MAIN_SITE_URL =
  import.meta.env.VITE_MAIN_SITE_URL || "https://vital-green-frontend.vercel.app"

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price350: "",
    price500: "",
    stock: ""
  })
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const productsData = await productsAPI.getAll()
      const productsArray = productsData.products || productsData || []
      setProducts(Array.isArray(productsArray) ? productsArray : [])

      try {
        const ordersData = await ordersAPI.getAll()
        setOrders(ordersData.orders || ordersData || [])
      } catch (_err) {
        setOrders([
          { id: 1001, customer: "John Doe", total: 24.99, status: "pending", date: "2026-02-04" },
          { id: 1002, customer: "Jane Smith", total: 35.50, status: "shipped", date: "2026-02-03" },
          { id: 1003, customer: "Bob Johnson", total: 18.75, status: "delivered", date: "2026-02-02" },
        ])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setProducts([
        { id: 1, name: "Passion Fruit Juice", price: 5.49, stock: 45, status: "active" },
        { id: 2, name: "Pineapple Fresh", price: 4.99, stock: 32, status: "active" },
        { id: 3, name: "Tiger Nut Smoothie", price: 6.49, stock: 18, status: "active" },
      ])
      setOrders([
        { id: 1001, customer: "John Doe", total: 24.99, status: "pending", date: "2026-02-04" },
        { id: 1002, customer: "Jane Smith", total: 35.50, status: "shipped", date: "2026-02-03" },
        { id: 1003, customer: "Bob Johnson", total: 18.75, status: "delivered", date: "2026-02-02" },
      ])
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0).toFixed(2),
    pendingOrders: orders.filter((o) => o.status === "pending").length,
  }

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.price350 && newProduct.price500) {
      try {
        const sizes = [
          { label: "350ml", price: parseFloat(newProduct.price350) },
          { label: "500ml", price: parseFloat(newProduct.price500) },
        ]
        const productData = {
          name: newProduct.name,
          description: newProduct.description || "Product added from admin panel",
          price: parseFloat(newProduct.price350),
          sizes,
          stock: parseInt(newProduct.stock) || 0,
          category: "juice",
        }
        const createdProduct = await productsAPI.create({ ...productData, imageFile })
        setProducts([...products, createdProduct])
        setNewProduct({ name: "", description: "", price350: "", price500: "", stock: "" })
        setImageFile(null)
        setShowAddProduct(false)
      } catch (error) {
        console.error("Failed to add product:", error)
        setProducts([
          ...products,
          {
            id: Math.max(...products.map((p) => p.id), 0) + 1,
            name: newProduct.name,
            description: newProduct.description || "Product added from admin panel",
            price: parseFloat(newProduct.price350),
            sizes: [
              { label: "350ml", price: parseFloat(newProduct.price350) },
              { label: "500ml", price: parseFloat(newProduct.price500) },
            ],
            stock: parseInt(newProduct.stock) || 0,
            status: "active",
          },
        ])
        setNewProduct({ name: "", description: "", price350: "", price500: "", stock: "" })
        setShowAddProduct(false)
      }
    }
  }

  const deleteProduct = async (id) => {
    try {
      await productsAPI.delete(id)
      setProducts(products.filter((p) => (p.id || p._id) !== id))
    } catch (error) {
      console.error("Failed to delete product:", error)
      setProducts(products.filter((p) => (p.id || p._id) !== id))
    }
  }

  const updateOrderStatus = (id, newStatus) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)))
  }

  return (
    <main className="bg-light text-dark min-h-screen">
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-lg font-bold">
            <span className="text-primary">Vital &amp; Green</span> Admin
          </div>
          <a
            href={MAIN_SITE_URL}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Back to Site
          </a>
        </div>
      </header>

      <section className="pt-24 px-6 max-w-7xl mx-auto pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">
              Admin <span className="text-primary">Dashboard</span>
            </h1>
          </div>
          <p className="text-gray-600 mt-2">Manage products, orders, and store settings</p>
        </motion.div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-gray-600 mt-4">Loading admin data...</p>
          </div>
        )}

        {!loading && (
        <>
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "products", label: "Products" },
            { id: "orders", label: "Orders" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-gray-600 text-sm font-medium">Total Products</h3>
                <p className="text-3xl font-bold text-primary mt-2">{stats.totalProducts}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-gray-600 text-sm font-medium">Total Orders</h3>
                <p className="text-3xl font-bold text-primary mt-2">{stats.totalOrders}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
                <p className="text-3xl font-bold text-gold mt-2">GHS{stats.totalRevenue}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 className="text-gray-600 text-sm font-medium">Pending Orders</h3>
                <p className="text-3xl font-bold text-orange-500 mt-2">{stats.pendingOrders}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-4 py-2">Order ID</th>
                      <th className="text-left px-4 py-2">Customer</th>
                      <th className="text-left px-4 py-2">Total</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-left px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">#{order.id}</td>
                        <td className="px-4 py-3">{order.customer}</td>
                        <td className="px-4 py-3 font-bold text-gold">${order.total.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "shipped"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "products" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-gold transition"
              >
                {showAddProduct ? "Cancel" : "Add Product"}
              </button>
            </div>

            {showAddProduct && (
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-lg font-bold mb-4">Add New Product</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Price 350ml (GHS)"
                    value={newProduct.price350}
                    onChange={(e) => setNewProduct({ ...newProduct, price350: e.target.value })}
                    className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Price 500ml (GHS)"
                    value={newProduct.price500}
                    onChange={(e) => setNewProduct({ ...newProduct, price500: e.target.value })}
                    className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleAddProduct}
                  className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Save Product
                </button>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No products available. Add a new product to get started.</p>
                </div>
              ) : (
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2">ID</th>
                    <th className="text-left px-4 py-2">Product Name</th>
                    <th className="text-left px-4 py-2">Price</th>
                    <th className="text-left px-4 py-2">Stock</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id || product._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">#{product.id || product._id}</td>
                      <td className="px-4 py-3">{product.name}</td>
                      <td className="px-4 py-3 font-bold text-gold">{product.sizes && product.sizes.length > 0 ? (
                        <div>
                          <div>GHS {product.sizes[0].price.toFixed(2)} <span className="text-xs text-gray-500">({product.sizes[0].label})</span></div>
                          <div>GHS {product.sizes[1].price.toFixed(2)} <span className="text-xs text-gray-500">({product.sizes[1].label})</span></div>
                        </div>
                      ) : (
                        <span>GHS {product.price.toFixed(2)}</span>
                      )}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            product.stock > 20 ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {product.status || "active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteProduct(product.id || product._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "orders" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6">Order Management</h2>
            <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2">Order ID</th>
                    <th className="text-left px-4 py-2">Customer</th>
                    <th className="text-left px-4 py-2">Total</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Date</th>
                    <th className="text-left px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">#{order.id}</td>
                      <td className="px-4 py-3">{order.customer}</td>
                      <td className="px-4 py-3 font-bold text-gold">${order.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`px-3 py-1 rounded text-sm font-medium border-0 cursor-pointer ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">{order.date}</td>
                      <td className="px-4 py-3">
                        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        </>
        )}
      </section>
    </main>
  )
}

export default Admin
