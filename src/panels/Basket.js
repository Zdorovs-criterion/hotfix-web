import React, {useMemo, useState} from 'react';
import {withRouter, Link} from 'react-router-dom';
import accounting from 'accounting';

import Checkbox from './Checkbox';

import edit from '../img/edit.svg';
import './place.css';


const Basket = ({match: {params: {areaId, itemId}}, foodAreas, order}) => {
    //А это мы добавили)
    let timeValidModel = JSON.parse(localStorage.getItem('timeValid'));
    const [timeValid, setTimeValid] = useState(timeValidModel === null ? true : timeValidModel);
    let fasterModel = JSON.parse(localStorage.getItem('faster'));
    const [faster, setFaster] = useState(fasterModel === null ? true : fasterModel);
    const [time, setTime] = useState(JSON.parse(localStorage.getItem('time')) || '');
    let selfServiceModel = JSON.parse(localStorage.getItem('selfService'));
    const [selfService, setSelfService] = useState(selfServiceModel === null ? false : selfServiceModel);
    const area = foodAreas.filter(area => area.id === areaId)[0];
    const item = area.items.filter(item => item.id === itemId)[0];

    const [price, products] = useMemo(() => {
        const foodIds = new Set((item.foods || []).map(item => item.id));

        const products = Object.values(order)
            .filter((value) => {
                const {item: {id}} = value;

                return foodIds.has(id);
            });

        const result = products.reduce((result, value) => {
            const {count, item} = value;

            return result + parseInt(item.price) * parseInt(count);
        }, 0);

        return [accounting.formatNumber(result, 0, ' '), products];
    }, [order, item]);

    //HACKATHON EDIT
    let makeOrder = null
    if (+price !== 0 && (timeValid || faster)) {
        makeOrder = <Link to={`/order/${area.id}/${item.id}`} className="Place__order">
            Оплатить {price}
        </Link>
    } else {
        makeOrder = <div className="Place__order nonactive">
            Оплатить {price}
        </div>
        //HACKATHON EDIT
    }
    let error = <span className="errorSpan">Время должно быть в формате "час:время" </span>
    return (
        <div className="Place">
            <header className="Place__header">
                <aside className="Place__trz">
                    <h1 className="Place__head">
                        <Link to="/" className="Place__logo">
                            {area.name}
                        </Link>
                    </h1>
                    <Link to="/edit" className="Place__change-tz">
                        <img
                            alt="change-profile"
                            src={edit}
                        />
                    </Link>
                </aside>
            </header>
            <aside className="Place__restoraunt">
                <img
                    className="Place__restoraunt-logo"
                    alt="Fastfood logo"
                    src={item.image}
                />
                <h2
                    className="Place__restoraunt-name"
                >
                    {item.name}
                </h2>
                <p className="Place__restoraunt-type">
                    {item.description}
                </p>
            </aside>
            <div className="Place__products-wrapper">
                <ul className="Place__products">
                    {products.map(({item, count}) => (
                        <li
                            className="Place__product"
                            key={item.id}
                        >
                            <img
                                className="Place__product-logo"
                                alt="Ordered product logo"
                                src={item.image}
                            />
                            <h3
                                className="Place__product-name"
                            >
                                {item.name}
                            </h3>
                            <p
                                className="Place__product-price"
                            >
                                Цена: {item.price}
                            </p>
                            <p
                                className="Place__product-count"
                            >
                                x{count}
                            </p>
                        </li>
                    ))}
                </ul>
                <Link
                    className="Place__change-product"
                    to={`/place/${areaId}/${itemId}`}
                >
                    Изменить
                </Link>
            </div>
            <div className="Place__choice">
                <h3>Время:</h3>
                <div className="Place__choice-item">
                    <span>Как можно быстрее</span>
                    <Checkbox
                        checked={faster}
                        onToggle={() => {
                            if (faster) {
                                setFaster(false);
                                setTimeValid(false)
                            } else {
                                setTime('');
                                setFaster(true);
                                setTimeValid(true)
                            }
                            localStorage.setItem('faster', JSON.stringify(faster));
                            localStorage.setItem('time', JSON.stringify(time));
                            localStorage.setItem('timeValid', JSON.stringify(timeValid));
                        }}
                    />
                </div>
                <div className="Place__choice-item">
                    <span>Назначить</span>
                    <input
                        placeholder="hh:mm"
                        value={time}
                        onFocus={() => {
                            setFaster(false);
                            localStorage.setItem('faster', JSON.stringify(faster));
                        }}
                        onChange={event => {
                            setFaster(false);
                            setTime(event.target.value);
                            localStorage.setItem('faster', JSON.stringify(faster));
                            localStorage.setItem('time', JSON.stringify(time));
                        }}
                        onBlur={() => {
                            if (time) {
                                setFaster(false);
                                let timeVal = time.split(':');
                                let hour = parseInt(timeVal[0], 10);
                                let min = parseInt(timeVal[1], 10);
                                if (hour < 24 && hour >= 0 && min <= 59 && min >= 0) {
                                    setTimeValid(true)
                                } else {
                                    setTimeValid(false)
                                }
                                localStorage.setItem('faster', JSON.stringify(faster));
                                localStorage.setItem('time', JSON.stringify(time));
                                localStorage.setItem('timeValid', JSON.stringify(timeValid));
                            }
                        }}
                    />
                    {!timeValid && error}
                </div>
                <div className="Place__choice-item">
                    <h3>С собой</h3>
                    <Checkbox checked={selfService} onToggle={() => {
                        setSelfService(!selfService);
                        localStorage.setItem('selfService', JSON.stringify(selfService));
                        console.log(localStorage)

                    }}/>
                </div>
                <div className="Place__choice-item">
                    <h3>На месте</h3>
                    <Checkbox checked={!selfService} onToggle={() => {
                        setSelfService(!selfService);
                        localStorage.setItem('selfService', JSON.stringify(selfService));
                        console.log(localStorage)
                    }}/>
                </div>
            </div>
            <footer className="Place__footer">
                {makeOrder}
            </footer>
        </div>
    );
};

export default withRouter(Basket);
