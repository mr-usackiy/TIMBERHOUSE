const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

function cleanDist(){
    return del('dist')
}


function images() {
    return src('app/images/**/*')
        .pipe(imagemin(
            [
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]
    ))
        .pipe(dest('dist/images'))
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}




function styles() {
    return src('app/scss/style.scss')
        .pipe(scss({ outputStyle: 'compressed' }))//compressed сжимает файл стилей. Если надо красивый файл, то применяй expanded
        .pipe(concat('style.min.css'))// переименовывает файл конечный
        .pipe(postcss([autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        })]))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function build() {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ], { base: 'app' })
        .pipe(dest('dist'))
}





function watching() {
    watch(['app/scss/**/*.scss'], styles); //онлайн отслеживает изменения и сразу все обновляет
    watch(['app/js/main.js', '!app/js/main.min.js'], scripts);//js
    watch(['app/*.html']).on('change', browserSync.reload);//html
};





exports.styles = styles;//  сжимает css, преобразовывает sass и мутит кроссбраузерность
exports.watching = watching;// функция постоянного отслеживания изменений и их актуализациии во всех связанных файлах
exports.browsersync = browsersync;// типо лайвсервер просто открывает в локалхосте страницу 
exports.scripts = scripts;// создает ****.MIN.js - сжатую версию джс для финалочки и помещает ее в нужную папку
exports.cleanDist = cleanDist;// удаляет папку финальную папку dist
exports.images = images;// сжимает картиночки


exports.build = series(cleanDist, images, build); // удаляет финальную папку дист потом заливает туда новые файлы  с изменениями ( для переделывания - исправления)
exports.default = parallel(styles, scripts, browsersync, watching); // все целиком это лайвсеревер