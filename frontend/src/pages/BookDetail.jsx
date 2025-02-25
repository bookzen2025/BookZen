import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import Footer from '../components/Footer';
import { TbShoppingBagPlus } from 'react-icons/tb';
import { FaBookOpen, FaCalendarAlt } from 'react-icons/fa';
import { BsPersonFill, BsBuildingsFill } from 'react-icons/bs';
import axios from 'axios';
import { toast } from 'react-toastify';

const BookDetail = () => {
  const { id } = useParams();
  const { currency, addToCart, backendUrl } = useContext(ShopContext);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.post(`${backendUrl}/api/product/single`, { productId: id });
        if (response.data.success) {
          setBook(response.data.product);
        } else {
          toast.error(response.data.message);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
        toast.error(error.message);
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, backendUrl]);

  if (loading) {
    return (
      <div className="max-padd-container min-h-screen pt-28 flex items-center justify-center">
        <div className="animate-pulse bg-secondary h-10 w-10 rounded-full"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-padd-container min-h-screen pt-28 flex items-center justify-center">
        <p className="text-lg">Book not found</p>
      </div>
    );
  }

  return (
    <section className="max-padd-container min-h-screen">
      <div className="pt-28 pb-16">
        {/* Book Info Section */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          {/* Book Image */}
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="bg-primary p-6 rounded-3xl overflow-hidden relative group shadow-lg hover:shadow-xl transition-all duration-300">
              <img
                src={book.image}
                alt={book.name}
                className="shadow-xl shadow-slate-900/30 rounded-lg max-w-[300px] w-full object-cover aspect-[3/4]"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
            </div>
          </div>

          {/* Book Details */}
          <div className="w-full md:w-2/3">
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="h1 text-tertiary mb-1 text-4xl md:text-5xl font-bold">{book.name}</h1>
                <div className="flex items-center gap-2">
                  <span className="medium-16 text-secondary capitalize px-3 py-1 bg-primary rounded-full text-sm">{book.category}</span>
                  {book.author && (
                    <div className="flex items-center gap-1">
                      <span className="inline-block h-1 w-1 rounded-full bg-gray-400"></span>
                      <span className="medium-16">By {book.author}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
              <h3 className="text-3xl font-bold text-secondaryOne">{currency}{book.price.toLocaleString('vi-VN')}</h3>
                <button
                  onClick={() => addToCart(book._id)}
                  className="btn-secondaryOne flex items-center gap-2 hover:shadow-md transition-shadow duration-300"
                >
                  <TbShoppingBagPlus className="text-lg" />
                  Add to Cart
                </button>
              </div>

              {/* Book Details Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h4 className="text-xl font-bold text-tertiary mb-4 flex items-center">
                  <span className="inline-block w-2 h-6 bg-secondary rounded-full mr-2"></span>
                  Book Details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {book.author && (
                    <div className="flex items-center gap-3">
                      <BsPersonFill className="text-secondary text-xl" />
                      <div>
                        <p className="text-sm text-gray-500">Author</p>
                        <p className="font-medium">{book.author}</p>
                      </div>
                    </div>
                  )}
                  
                  {book.publisher && (
                    <div className="flex items-center gap-3">
                      <BsBuildingsFill className="text-secondary text-xl" />
                      <div>
                        <p className="text-sm text-gray-500">Publisher</p>
                        <p className="font-medium">{book.publisher}</p>
                      </div>
                    </div>
                  )}
                  
                  {book.publishedYear && (
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-secondary text-xl" />
                      <div>
                        <p className="text-sm text-gray-500">Published Year</p>
                        <p className="font-medium">{book.publishedYear}</p>
                      </div>
                    </div>
                  )}
                  
                  {book.pages && (
                    <div className="flex items-center gap-3">
                      <FaBookOpen className="text-secondary text-xl" />
                      <div>
                        <p className="text-sm text-gray-500">Pages</p>
                        <p className="font-medium">{book.pages}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h4 className="text-xl font-bold text-tertiary mb-4 flex items-center">
                  <span className="inline-block w-2 h-6 bg-secondary rounded-full mr-2"></span>
                  Description
                </h4>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default BookDetail;