export const Card = ({ children, className = "" }) => {
    return (
      <div className={`bg-white shadow-lg rounded-xl p-4 ${className}`}>
        {children}
      </div>
    );
  };

export default Card;