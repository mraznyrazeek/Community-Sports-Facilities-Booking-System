const API_BASE_URL = "https://localhost:7252/api";

// AUTH HELPERS
const getToken = () => {
  return localStorage.getItem("token");
};

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(
      "Unable to connect to the API. Make sure the backend is running."
    );
  }

  // 204 No Content
  if (response.status === 204) {
    return null;
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // Unauthorized
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("member");

    throw new Error(
      "Your session has expired. Please log in again."
    );
  }

  // Forbidden
  if (response.status === 403) {
    throw new Error(
      "You do not have permission to perform this action."
    );
  }

  // Other errors
  if (!response.ok) {
    let message = "Something went wrong.";

    if (typeof data === "string") {
      message = data;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.title) {
      message = data.title;
    } else if (data?.errors) {
      message = "Please check the information you entered.";
    }

    throw new Error(message);
  }

  return data;
};

// AUTH
export const register = async (userData) => {
  return request("/Auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};


export const login = async (credentials) => {
  const data = await request("/Auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (data?.token) {
    localStorage.setItem("token", data.token);
  }

  if (data?.member) {
    localStorage.setItem(
      "member",
      JSON.stringify(data.member)
    );
  }

  return data;
};


export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("member");
};


export const getCurrentMember = () => {
  const member = localStorage.getItem("member");

  try {
    return member ? JSON.parse(member) : null;
  } catch {
    return null;
  }
};


export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// SPORTS
export const getSports = () => {
  return request("/Sports");
};


export const getSport = (id) => {
  return request(`/Sports/${id}`);
};


export const createSport = (sport) => {
  return request("/Sports", {
    method: "POST",
    body: JSON.stringify(sport),
  });
};


export const updateSport = (id, sport) => {
  return request(`/Sports/${id}`, {
    method: "PUT",
    body: JSON.stringify(sport),
  });
};


export const deleteSport = (id) => {
  return request(`/Sports/${id}`, {
    method: "DELETE",
  });
};

// FACILITIES
export const getFacilities = () => {
  return request("/Facilities");
};


export const getFacility = (id) => {
  return request(`/Facilities/${id}`);
};


export const createFacility = (facility) => {
  return request("/Facilities", {
    method: "POST",
    body: JSON.stringify(facility),
  });
};


export const updateFacility = (id, facility) => {
  return request(`/Facilities/${id}`, {
    method: "PUT",
    body: JSON.stringify(facility),
  });
};


export const deleteFacility = (id) => {
  return request(`/Facilities/${id}`, {
    method: "DELETE",
  });
};

// MEMBER SPORTS
export const getMySports = () => {
  return request("/MemberSports");
};


export const getMySport = (sportId) => {
  return request(`/MemberSports/${sportId}`);
};


export const joinSport = (sportId) => {
  return request("/MemberSports", {
    method: "POST",
    body: JSON.stringify({
      sportId,
    }),
  });
};


export const updateMySport = (sportId, joinedAt) => {
  return request(`/MemberSports/${sportId}`, {
    method: "PUT",
    body: JSON.stringify({
      joinedAt,
    }),
  });
};


export const leaveSport = (sportId) => {
  return request(`/MemberSports/${sportId}`, {
    method: "DELETE",
  });
};

// BOOKINGS
export const getBookings = () => {
  return request("/Bookings");
};


export const getBooking = (id) => {
  return request(`/Bookings/${id}`);
};


export const createBooking = (booking) => {
  return request("/Bookings", {
    method: "POST",
    body: JSON.stringify(booking),
  });
};


export const updateBooking = (id, booking) => {
  return request(`/Bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify(booking),
  });
};


export const deleteBooking = (id) => {
  return request(`/Bookings/${id}`, {
    method: "DELETE",
  });
};

// REVIEWS
export const getReviews = () => {
  return request("/Reviews");
};


export const getReview = (id) => {
  return request(`/Reviews/${id}`);
};


export const createReview = (review) => {
  return request("/Reviews", {
    method: "POST",
    body: JSON.stringify(review),
  });
};


export const updateReview = (id, review) => {
  return request(`/Reviews/${id}`, {
    method: "PUT",
    body: JSON.stringify(review),
  });
};


export const deleteReview = (id) => {
  return request(`/Reviews/${id}`, {
    method: "DELETE",
  });
};


// INQUIRIES
export const getInquiries = () => {
  return request("/Inquiries");
};


export const getInquiry = (id) => {
  return request(`/Inquiries/${id}`);
};


export const createInquiry = (inquiry) => {
  return request("/Inquiries", {
    method: "POST",
    body: JSON.stringify(inquiry),
  });
};


export const updateInquiry = (id, inquiry) => {
  return request(`/Inquiries/${id}`, {
    method: "PUT",
    body: JSON.stringify(inquiry),
  });
};


export const deleteInquiry = (id) => {
  return request(`/Inquiries/${id}`, {
    method: "DELETE",
  });
};


// MEMBERS
export const getMembers = () => {
  return request("/Members");
};


export const getMember = (id) => {
  return request(`/Members/${id}`);
};


export const updateMember = (id, member) => {
  return request(`/Members/${id}`, {
    method: "PUT",
    body: JSON.stringify(member),
  });
};


export const deleteMember = (id) => {
  return request(`/Members/${id}`, {
    method: "DELETE",
  });
};

export const apiRequest = request;