import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";

const NavBar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                {/* Brand */}
                <a className="navbar-brand" href="/interface/public">LLM Evaluation</a>

                {/* Toggler for collapsing navbar on smaller screens */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                    aria-controls="navbarContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navbar Links and Search Bar */}
                <div className="collapse navbar-collapse" id="navbarContent">
                    {/* Left Side Links */}
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a className="nav-link active" aria-current="page" href="/interface/public">Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/about">About</a>
                        </li>
                    </ul>

                    {/* Search Bar */}
                    <form
                        className="d-flex align-items-center"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const searchValue = e.target.searchInput.value;
                            console.log("Searching for:", searchValue);
                        }}
                    >
                        <div className="input-group">
                                <span className="input-group-text bg-light" id="search-icon">
                                   <FontAwesomeIcon icon={faSearch}/>
                                </span>

                            <input
                                className="form-control"
                                type="text"
                                placeholder="Search"
                                aria-label="Search"
                                name="searchInput"
                                aria-describedby="search-icon"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </nav>
    )
}

export default NavBar;
