import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import BuyerShop from "./pages/buyer/Shop";
import BuyerCart from "./pages/buyer/Cart";
import BuyerCheckout from "./pages/buyer/Checkout";
import BuyerOrders from "./pages/buyer/Orders";
import BuyerReviews from "./pages/buyer/Reviews";
import BuyerProfile from "./pages/buyer/Profile";
import SellerDashboard from "./pages/seller/Dashboard";
import SellerProducts from "./pages/seller/Products";
import SellerOrders from "./pages/seller/Orders";
import SellerEarnings from "./pages/seller/Earnings";
import SellerProfile from "./pages/seller/Profile";
import DeliveryDashboard from "./pages/delivery/Dashboard";
import DeliveryPickups from "./pages/delivery/Pickups";
import DeliveryActive from "./pages/delivery/ActiveDeliveries";
import DeliveryHistory from "./pages/delivery/History";
import DeliveryProfile from "./pages/delivery/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminOrders from "./pages/admin/Orders";
import AdminPayments from "./pages/admin/Payments";
import { ShoppingBag, ShoppingCart, Package, Star, User, LayoutDashboard, Box, ClipboardList, IndianRupee, Store, Bike, MapPin, Truck, History, Users, CreditCard } from "lucide-react";

const queryClient = new QueryClient();

const buyerNav = [
  { title: "Shop", url: "/buyer/shop", icon: ShoppingBag },
  { title: "Cart", url: "/buyer/cart", icon: ShoppingCart },
  { title: "Orders", url: "/buyer/orders", icon: Package },
  { title: "Reviews", url: "/buyer/reviews", icon: Star },
  { title: "Profile", url: "/buyer/profile", icon: User },
];
const sellerNav = [
  { title: "Dashboard", url: "/seller/dashboard", icon: LayoutDashboard },
  { title: "Products", url: "/seller/products", icon: Box },
  { title: "Orders", url: "/seller/orders", icon: ClipboardList },
  { title: "Earnings", url: "/seller/earnings", icon: IndianRupee },
  { title: "Profile", url: "/seller/profile", icon: Store },
];
const deliveryNav = [
  { title: "Dashboard", url: "/delivery/dashboard", icon: Bike },
  { title: "Pickups", url: "/delivery/pickups", icon: MapPin },
  { title: "Active", url: "/delivery/active", icon: Truck },
  { title: "History", url: "/delivery/history", icon: History },
  { title: "Profile", url: "/delivery/profile", icon: User },
];
const adminNav = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Orders", url: "/admin/orders", icon: Package },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
];

const BuyerLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["buyer"]}><DashboardLayout navItems={buyerNav} title="PetalRush">{children}</DashboardLayout></ProtectedRoute>
);
const SellerLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["seller"]}><DashboardLayout navItems={sellerNav} title="Seller Panel">{children}</DashboardLayout></ProtectedRoute>
);
const DeliveryLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["delivery"]}><DashboardLayout navItems={deliveryNav} title="Delivery">{children}</DashboardLayout></ProtectedRoute>
);
const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["admin"]}><DashboardLayout navItems={adminNav} title="Admin">{children}</DashboardLayout></ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Buyer */}
            <Route path="/buyer/shop" element={<BuyerLayout><BuyerShop /></BuyerLayout>} />
            <Route path="/buyer/cart" element={<BuyerLayout><BuyerCart /></BuyerLayout>} />
            <Route path="/buyer/checkout" element={<BuyerLayout><BuyerCheckout /></BuyerLayout>} />
            <Route path="/buyer/orders" element={<BuyerLayout><BuyerOrders /></BuyerLayout>} />
            <Route path="/buyer/reviews" element={<BuyerLayout><BuyerReviews /></BuyerLayout>} />
            <Route path="/buyer/profile" element={<BuyerLayout><BuyerProfile /></BuyerLayout>} />
            {/* Seller */}
            <Route path="/seller/dashboard" element={<SellerLayout><SellerDashboard /></SellerLayout>} />
            <Route path="/seller/products" element={<SellerLayout><SellerProducts /></SellerLayout>} />
            <Route path="/seller/orders" element={<SellerLayout><SellerOrders /></SellerLayout>} />
            <Route path="/seller/earnings" element={<SellerLayout><SellerEarnings /></SellerLayout>} />
            <Route path="/seller/profile" element={<SellerLayout><SellerProfile /></SellerLayout>} />
            {/* Delivery */}
            <Route path="/delivery/dashboard" element={<DeliveryLayout><DeliveryDashboard /></DeliveryLayout>} />
            <Route path="/delivery/pickups" element={<DeliveryLayout><DeliveryPickups /></DeliveryLayout>} />
            <Route path="/delivery/active" element={<DeliveryLayout><DeliveryActive /></DeliveryLayout>} />
            <Route path="/delivery/history" element={<DeliveryLayout><DeliveryHistory /></DeliveryLayout>} />
            <Route path="/delivery/profile" element={<DeliveryLayout><DeliveryProfile /></DeliveryLayout>} />
            {/* Admin */}
            <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
            <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
            <Route path="/admin/payments" element={<AdminLayout><AdminPayments /></AdminLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
