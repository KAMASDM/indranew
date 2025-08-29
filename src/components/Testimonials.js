const testimonials = [
  {
    quote: "The free meal program by Indraprasth Foundation is a blessing for daily wage workers like me. Their work is truly life-saving.",
    name: "Ramesh Patel",
    title: "Community Member"
  },
  {
    quote: "I'm proud to support an organization that is so transparent and impactful. Seeing the smiling faces of the children they help is the greatest reward.",
    name: "Sunita Sharma",
    title: "Donor"
  },
  {
    quote: "Volunteering with the foundation has been an incredibly fulfilling experience. The team's dedication is inspiring.",
    name: "Amit Desai",
    title: "Volunteer"
  }
];

const Testimonials = () => {
  return (
    <div className="bg-orange-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            What People Are Saying
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Real stories from the people we've touched.
          </p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="bg-white p-8 rounded-lg shadow-md">
              <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              <div className="mt-4 font-bold text-gray-900">{testimonial.name}</div>
              <div className="text-sm text-orange-500">{testimonial.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;