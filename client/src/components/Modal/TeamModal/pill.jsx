const Pill = ({ image, text, onClick }) => {
    return (
      <span className="user-pill" onClick={onClick}>
        <img src={image} alt={text} />
        <span>{text}</span>
        <span className="close-icon">&times;</span>
      </span>
    );
  };
  
  export default Pill;
   