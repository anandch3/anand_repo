const DetailsPopup = ({ name, description, clickedHidePopUp }) => {
    return (
        <>
            <div className="details-pop-up">
                <div className="details-pop-up-main">
                    <div className="details-pop-up-inner">
                        <div className="details-pop-up-heading">
                            <p className="details-pop-up-heading-txt">{name}</p>
                        </div>
                        <div className="details-pop-up-description">
                            <p className="details-pop-up-description-txt">{description}</p>
                        </div>
                        <div className="details-pop-up-close">
                            <p className="details-pop-up-close-txt" onClick={(e) => clickedHidePopUp()}>close</p>
                        </div>
                    </div>
                </div>

                <div className="details-pop-up-overlay">&nbsp;</div>
            </div>
        </>
    )
}

export default DetailsPopup;