export abstract class ViewMapper<I, O> {
    abstract toView(input: I): Promise<O>;

    async toViews(input: I[]): Promise<O[]> {
        return Promise.all(input.map((i) => this.toView(i)));
    }
}
