const Footer = () => {
    return (
        <footer className="row mt-4 bg-dark text-light py-4">
            <div className="text-center">
                <p className="mb-0">&copy; {new Date().getFullYear()} LLM Metrics Evaluation. All rights
                    reserved.</p>
            </div>
        </footer>
    )
}

export default Footer;